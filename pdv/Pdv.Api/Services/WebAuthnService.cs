using Fido2NetLib;
using Fido2NetLib.Objects;
using Microsoft.AspNetCore.WebUtilities;
using Pdv.Api.Data;
using Pdv.Api.Models;
using System.Text;

namespace Pdv.Api.Services;

public class WebAuthnService(IFido2 fido2, AppDbContext db, WebAuthnChallengeStore store, AuthService auth)
{
    private static readonly Fido2User AdminUser = new()
    {
        Id = Encoding.UTF8.GetBytes("admin"),
        Name = "admin",
        DisplayName = "Administrador"
    };

    public CredentialCreateOptions GetRegisterOptions()
    {
        var existingKeys = db.WebAuthnCredentials
            .Select(c => new PublicKeyCredentialDescriptor(WebEncoders.Base64UrlDecode(c.CredentialId)))
            .ToList();

        var options = fido2.RequestNewCredential(new RequestNewCredentialParams
        {
            User = AdminUser,
            ExcludeCredentials = existingKeys,
            AuthenticatorSelection = new AuthenticatorSelection
            {
                ResidentKey = ResidentKeyRequirement.Discouraged,
                UserVerification = UserVerificationRequirement.Required,
            },
            AttestationPreference = AttestationConveyancePreference.None,
        });

        store.RegisterOptions = options;
        return options;
    }

    public async Task<string?> VerifyRegisterAsync(AuthenticatorAttestationRawResponse attestation)
    {
        if (store.RegisterOptions is null)
            return "Sessão de registro expirada. Abra as opções novamente.";

        try
        {
            var result = await fido2.MakeNewCredentialAsync(new MakeNewCredentialParams
            {
                AttestationResponse = attestation,
                OriginalOptions = store.RegisterOptions,
                IsCredentialIdUniqueToUserCallback = async (param, _) =>
                {
                    var encoded = WebEncoders.Base64UrlEncode(param.CredentialId);
                    return !db.WebAuthnCredentials.Any(c => c.CredentialId == encoded);
                },
            });

            db.WebAuthnCredentials.Add(new WebAuthnCredential
            {
                CredentialId = WebEncoders.Base64UrlEncode(result.Id),
                PublicKey = Convert.ToBase64String(result.PublicKey),
                SignCount = result.SignCount,
                CreatedAt = DateTime.UtcNow,
            });

            await db.SaveChangesAsync();
            store.RegisterOptions = null;
            return null;
        }
        catch (Exception ex)
        {
            return ex.Message;
        }
    }

    public AssertionOptions GetLoginOptions()
    {
        var existingKeys = db.WebAuthnCredentials
            .Select(c => new PublicKeyCredentialDescriptor(WebEncoders.Base64UrlDecode(c.CredentialId)))
            .ToList();

        var options = fido2.GetAssertionOptions(new GetAssertionOptionsParams
        {
            AllowedCredentials = existingKeys,
            UserVerification = UserVerificationRequirement.Required,
        });

        store.LoginOptions = options;
        return options;
    }

    public async Task<(string? token, string? error)> VerifyLoginAsync(AuthenticatorAssertionRawResponse assertion)
    {
        if (store.LoginOptions is null)
            return (null, "Sessão expirada. Tente novamente.");

        try
        {
            var cred = db.WebAuthnCredentials
                .FirstOrDefault(c => c.CredentialId == assertion.Id);

            if (cred is null) return (null, "Credencial não encontrada.");

            var result = await fido2.MakeAssertionAsync(new MakeAssertionParams
            {
                AssertionResponse = assertion,
                OriginalOptions = store.LoginOptions,
                StoredPublicKey = Convert.FromBase64String(cred.PublicKey),
                StoredSignatureCounter = cred.SignCount,
                IsUserHandleOwnerOfCredentialIdCallback = async (_, _) => true,
            });

            cred.SignCount = result.SignCount;
            await db.SaveChangesAsync();

            store.LoginOptions = null;
            return (auth.GerarToken(), null);
        }
        catch (Exception ex)
        {
            return (null, ex.Message);
        }
    }

    public bool TemCredencialCadastrada() => db.WebAuthnCredentials.Any();
}
