using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class EstoqueService
{
    public List<EstoqueMovimentacao> ListarMovimentacoes() => FakeDatabase.Movimentacoes;

    public (EstoqueMovimentacao? mov, string? erro) RegistrarEntrada(EntradaEstoqueRequest req)
    {
        if (req.Quantidade <= 0)
            return (null, "Quantidade deve ser maior que zero.");

        var produto = FakeDatabase.Produtos.FirstOrDefault(p => p.Id == req.ProdutoId);
        if (produto is null)
            return (null, $"Produto com Id {req.ProdutoId} não encontrado.");

        produto.Estoque += req.Quantidade;
        if (req.PrecoCusto > 0)
            produto.PrecoCusto = req.PrecoCusto;

        var mov = new EstoqueMovimentacao
        {
            Id = FakeDatabase.NextMovId(),
            ProdutoId = produto.Id,
            NomeProduto = produto.Nome,
            Tipo = "Entrada",
            Quantidade = req.Quantidade,
            PrecoCusto = req.PrecoCusto,
            Data = DateTime.Now
        };

        FakeDatabase.Movimentacoes.Add(mov);
        return (mov, null);
    }
}
