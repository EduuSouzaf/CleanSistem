using Pdv.Api.Data;
using Pdv.Api.DTOs;
using Pdv.Api.Models;

namespace Pdv.Api.Services;

public class EstoqueService(AppDbContext db)
{
    public List<EstoqueMovimentacao> ListarMovimentacoes() =>
        [.. db.Movimentacoes.OrderByDescending(m => m.Data)];

    public (EstoqueMovimentacao? mov, string? erro) RegistrarEntrada(EntradaEstoqueRequest req)
    {
        if (req.Quantidade <= 0)
            return (null, "Quantidade deve ser maior que zero.");

        var produto = db.Produtos.FirstOrDefault(p => p.Id == req.ProdutoId);
        if (produto is null)
            return (null, $"Produto com Id {req.ProdutoId} não encontrado.");

        produto.Estoque += req.Quantidade;
        if (req.PrecoCusto > 0)
            produto.PrecoCusto = req.PrecoCusto;

        var mov = new EstoqueMovimentacao
        {
            ProdutoId = produto.Id,
            NomeProduto = produto.Nome,
            Tipo = "Entrada",
            Quantidade = req.Quantidade,
            PrecoCusto = req.PrecoCusto,
            LocalCompra = req.LocalCompra?.Trim(),
            Data = DateTime.UtcNow
        };

        db.Movimentacoes.Add(mov);
        db.SaveChanges();
        return (mov, null);
    }
}
