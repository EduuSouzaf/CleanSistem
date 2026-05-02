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

    [HttpPost]
    public IActionResult Registrar([FromBody] CriarVendaRequest req)
    {
        var (venda, erro) = _service.Registrar(req);
        if (erro is not null)
            return BadRequest(new { message = erro });
        return Ok(venda);
    }
}
