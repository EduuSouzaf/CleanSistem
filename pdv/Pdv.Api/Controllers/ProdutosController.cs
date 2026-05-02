using Microsoft.AspNetCore.Mvc;
using Pdv.Api.DTOs;
using Pdv.Api.Services;

namespace Pdv.Api.Controllers;

[ApiController]
[Route("api/v1/produtos")]
public class ProdutosController(ProdutoService _service) : ControllerBase
{
    [HttpGet]
    public IActionResult Listar([FromQuery] string? codigoBarras)
    {
        if (!string.IsNullOrWhiteSpace(codigoBarras))
        {
            var p = _service.BuscarPorCodigo(codigoBarras);
            if (p is null)
                return NotFound(new { message = $"Produto com código '{codigoBarras}' não encontrado." });
            return Ok(p);
        }
        return Ok(_service.ListarTodos());
    }

    [HttpGet("{codigoBarras}")]
    public IActionResult BuscarPorCodigo(string codigoBarras)
    {
        var p = _service.BuscarPorCodigo(codigoBarras);
        if (p is null)
            return NotFound(new { message = $"Produto com código '{codigoBarras}' não encontrado." });
        return Ok(p);
    }

    [HttpPost]
    public IActionResult Criar([FromBody] CriarProdutoRequest req)
    {
        var (produto, erro) = _service.Criar(req);
        if (erro is not null) return BadRequest(new { message = erro });
        return CreatedAtAction(nameof(BuscarPorCodigo), new { codigoBarras = produto!.CodigoBarras }, produto);
    }

    [HttpPut("{id:int}")]
    public IActionResult Atualizar(int id, [FromBody] AtualizarProdutoRequest req)
    {
        var (produto, erro) = _service.Atualizar(id, req);
        if (erro is not null) return BadRequest(new { message = erro });
        return Ok(produto);
    }

    [HttpDelete("{id:int}")]
    public IActionResult Excluir(int id)
    {
        var erro = _service.Excluir(id);
        if (erro is not null) return NotFound(new { message = erro });
        return NoContent();
    }
}
