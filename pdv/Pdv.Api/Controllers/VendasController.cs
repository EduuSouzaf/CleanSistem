using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pdv.Api.DTOs;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/vendas")]
public class VendasController(VendaService _vendaService, DevolucaoService _devolucaoService) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar() => Ok(_vendaService.ListarTodas());

    [HttpGet("{id:int}")]
    public IActionResult BuscarPorId(int id)
    {
        var venda = _vendaService.BuscarPorId(id);
        if (venda is null) return NotFound(new { message = "Venda não encontrada." });
        return Ok(venda);
    }

    [HttpPost]
    public IActionResult Registrar([FromBody] CriarVendaRequest req)
    {
        var (venda, erro) = _vendaService.Registrar(req);
        if (erro is not null) return BadRequest(new { message = erro });
        return Ok(venda);
    }

    [HttpGet("{id:int}/devolucoes")]
    public IActionResult ListarDevolucoes(int id) =>
        Ok(_devolucaoService.ListarPorVenda(id));

    [HttpPost("{id:int}/devolucao")]
    public IActionResult Devolver(int id, [FromBody] DevolucaoRequest req)
    {
        var (devolucao, erro) = _devolucaoService.Registrar(id, req);
        if (erro is not null) return BadRequest(new { message = erro });
        return Ok(devolucao);
    }
}
