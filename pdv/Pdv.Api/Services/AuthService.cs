using Microsoft.AspNetCore.Identity;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Pdv.Api.Services;

public class AuthService(IConfiguration config)
{
    private readonly PasswordHasher<string> _hasher = new();

    public bool VerificarSenha(string senha)
    {
        var hash = config["AdminUser:SenhaHash"];
        if (string.IsNullOrEmpty(hash)) return false;
        var result = _hasher.VerifyHashedPassword("admin", hash, senha);
        return result != PasswordVerificationResult.Failed;
    }

    public string GerarToken()
    {
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(config["Jwt:Key"]!));
        var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var token = new JwtSecurityToken(
            issuer: config["Jwt:Issuer"],
            audience: config["Jwt:Audience"],
            claims: [new Claim(ClaimTypes.Name, "admin"), new Claim(ClaimTypes.Role, "Admin")],
            expires: DateTime.UtcNow.AddDays(7),
            signingCredentials: creds);

        return new JwtSecurityTokenHandler().WriteToken(token);
    }

    // Utilitário: gera hash para uma senha — usado apenas na configuração inicial
    public string GerarHash(string senha) => _hasher.HashPassword("admin", senha);
}
