using Microsoft.AspNetCore.Mvc;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/relatorios")]
public class RelatoriosController : ControllerBase
{
    private readonly RelatorioService _service = new();

    [HttpGet("vendas-dia")]
    public IActionResult VendasDia() => Ok(_service.VendasDia());

    [HttpGet("estoque")]
    public IActionResult Estoque() => Ok(_service.Estoque());
}
