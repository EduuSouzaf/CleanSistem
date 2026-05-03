using Fido2NetLib;

namespace Pdv.Api.Services;

// Singleton — mantém o challenge entre a requisição de opções e a verificação
public class WebAuthnChallengeStore
{
    public CredentialCreateOptions? RegisterOptions { get; set; }
    public AssertionOptions? LoginOptions { get; set; }
}
