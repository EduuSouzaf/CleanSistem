using Microsoft.AspNetCore.Mvc;
using Pdv.Api.DTOs;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/vendas")]
public class VendasController(VendaService _service) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar() => Ok(_service.ListarTodas());

    [HttpGet("{id:int}")]
    public IActionResult BuscarPorId(int id)
    {
        var venda = _service.BuscarPorId(id);
        if (venda is null) return NotFound(new { message = "Venda não encontrada." });
        return Ok(venda);
    }

    [HttpPost]
    public IActionResult Registrar([FromBody] CriarVendaRequest req)
    {
        var (venda, erro) = _service.Registrar(req);
        if (erro is not null) return BadRequest(new { message = erro });
        return Ok(venda);
    }

    [HttpPost("{id:int}/devolucao")]
    public IActionResult Devolver(int id, [FromBody] DevolucaoRequest req)
    {
        var (ok, erro) = _service.Devolver(id, req);
        if (!ok) return BadRequest(new { message = erro });
        return Ok(new { message = "Devolução registrada com sucesso." });
    }
}
