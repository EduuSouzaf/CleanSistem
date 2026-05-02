using Microsoft.AspNetCore.Mvc;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/relatorios")]
public class RelatoriosController(RelatorioService _service) : ControllerBase
{
    [HttpGet("vendas-dia")]
    public IActionResult VendasDia() => Ok(_service.VendasDia());

    [HttpGet("estoque")]
    public IActionResult Estoque() => Ok(_service.Estoque());
}
