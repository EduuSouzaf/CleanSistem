using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class ProdutoService
{
    public List<Produto> ListarTodos() => FakeDatabase.Produtos;

    public Produto? BuscarPorId(int id) =>
        FakeDatabase.Produtos.FirstOrDefault(p => p.Id == id);

    public Produto? BuscarPorCodigo(string codigoBarras) =>
        FakeDatabase.Produtos.FirstOrDefault(p => p.CodigoBarras == codigoBarras);

    public (Produto? produto, string? erro) Criar(CriarProdutoRequest req)
    {
        if (string.IsNullOrWhiteSpace(req.Nome))
            return (null, "Nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(req.CodigoBarras))
            return (null, "Código de barras é obrigatório.");

        if (FakeDatabase.Produtos.Any(p => p.CodigoBarras == req.CodigoBarras))
            return (null, $"Já existe um produto com o código '{req.CodigoBarras}'.");

        if (req.PrecoVenda <= 0)
            return (null, "Preço de venda deve ser maior que zero.");

        var produto = new Produto
        {
            Id = FakeDatabase.NextProdutoId(),
            CodigoBarras = req.CodigoBarras.Trim(),
            Nome = req.Nome.Trim(),
            PrecoCusto = req.PrecoCusto,
            PrecoVenda = req.PrecoVenda,
            Estoque = 0
        };

        FakeDatabase.Produtos.Add(produto);
        return (produto, null);
    }

    public (Produto? produto, string? erro) Atualizar(int id, AtualizarProdutoRequest req)
    {
        var produto = FakeDatabase.Produtos.FirstOrDefault(p => p.Id == id);
        if (produto is null)
            return (null, $"Produto com Id {id} não encontrado.");

        if (string.IsNullOrWhiteSpace(req.Nome))
            return (null, "Nome é obrigatório.");

        if (string.IsNullOrWhiteSpace(req.CodigoBarras))
            return (null, "Código de barras é obrigatório.");

        if (FakeDatabase.Produtos.Any(p => p.CodigoBarras == req.CodigoBarras && p.Id != id))
            return (null, $"Já existe outro produto com o código '{req.CodigoBarras}'.");

        if (req.PrecoVenda <= 0)
            return (null, "Preço de venda deve ser maior que zero.");

        produto.Nome = req.Nome.Trim();
        produto.CodigoBarras = req.CodigoBarras.Trim();
        produto.PrecoCusto = req.PrecoCusto;
        produto.PrecoVenda = req.PrecoVenda;

        return (produto, null);
    }

    public string? Excluir(int id)
    {
        var produto = FakeDatabase.Produtos.FirstOrDefault(p => p.Id == id);
        if (produto is null)
            return $"Produto com Id {id} não encontrado.";

        FakeDatabase.Produtos.Remove(produto);
        return null;
    }
}
