using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/relatorios")]
public class RelatoriosController(RelatorioService _service) : ControllerBase
{
    [HttpGet("vendas-dia")]
    public IActionResult VendasDia() => Ok(_service.VendasDia());

    [HttpGet("estoque")]
    public IActionResult Estoque() => Ok(_service.Estoque());

    [HttpGet("produtos-parados")]
    public IActionResult ProdutosParados() => Ok(_service.ProdutosParados());
}
