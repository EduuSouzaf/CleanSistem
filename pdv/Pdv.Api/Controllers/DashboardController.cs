using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Pdv.Api.Data;

namespace Pdv.Api.Controllers;

[Authorize]
[ApiController]
[Route("api/v1/dashboard")]
public class DashboardController(AppDbContext db) : ControllerBase
{
    [HttpGet("estoque")]
    public IActionResult Estoque()
    {
        var produtos = db.Produtos.Where(p => p.Estoque > 0).ToList();
        return Ok(new
        {
            totalItens    = produtos.Sum(p => p.Estoque),
            valorCusto    = produtos.Sum(p => p.PrecoCusto * p.Estoque),
            valorVenda    = produtos.Sum(p => p.PrecoVenda * p.Estoque),
            lucroPotencial = produtos.Sum(p => (p.PrecoVenda - p.PrecoCusto) * p.Estoque),
        });
    }
}
