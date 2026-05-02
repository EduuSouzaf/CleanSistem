using Fido2NetLib;
using Microsoft.AspNetCore.Mvc;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/webauthn")]
public class WebAuthnController(WebAuthnService _webauthn) : ControllerBase
{
    [HttpGet("status")]
    public IActionResult Status() => Ok(new { registrado = _webauthn.TemCredencialCadastrada() });

    [HttpGet("register/options")]
    public IActionResult RegisterOptions() => Ok(_webauthn.GetRegisterOptions());

    [HttpPost("register/verify")]
    public async Task<IActionResult> RegisterVerify([FromBody] AuthenticatorAttestationRawResponse response)
    {
        var erro = await _webauthn.VerifyRegisterAsync(response);
        if (erro is not null) return BadRequest(new { message = erro });
        return Ok(new { message = "Biometria cadastrada com sucesso!" });
    }

    [HttpGet("login/options")]
    public IActionResult LoginOptions()
    {
        if (!_webauthn.TemCredencialCadastrada())
            return BadRequest(new { message = "Nenhuma biometria cadastrada." });

        return Ok(_webauthn.GetLoginOptions());
    }

    [HttpPost("login/verify")]
    public async Task<IActionResult> LoginVerify([FromBody] AuthenticatorAssertionRawResponse response)
    {
        var (token, erro) = await _webauthn.VerifyLoginAsync(response);
        if (erro is not null) return Unauthorized(new { message = erro });
        return Ok(new { token });
    }
}
