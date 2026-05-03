using Microsoft.AspNetCore.Mvc;
using Pdv.Api.DTOs;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/auth")]
public class AuthController(AuthService _auth) : ControllerBase
{
    [HttpPost("login")]
    public IActionResult Login([FromBody] LoginRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Senha))
            return BadRequest(new { message = "Senha obrigatória." });

        if (!_auth.VerificarSenha(req.Senha))
            return Unauthorized(new { message = "Senha incorreta." });

        return Ok(new { token = _auth.GerarToken() });
    }
}
