using Microsoft.AspNetCore.Mvc;
using Pdv.Api.DTOs;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/estoque")]
public class EstoqueController(EstoqueService _service) : ControllerBase
{
    [HttpPost("entrada")]
    public IActionResult Entrada([FromBody] EntradaEstoqueRequest req)
    {
        var (mov, erro) = _service.RegistrarEntrada(req);
        if (erro is not null)
            return BadRequest(new { message = erro });
        return Ok(mov);
    }

    [HttpGet("movimentacoes")]
    public IActionResult Movimentacoes() => Ok(_service.ListarMovimentacoes());
}
