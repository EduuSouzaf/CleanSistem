using Microsoft.EntityFrameworkCore.Migrations;

#nullable disable

namespace Pdv.Api.Migrations
{
    /// <inheritdoc />
    public partial class AddLocalCompra : Migration
    {
        /// <inheritdoc />
        protected override void Up(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.AddColumn<string>(
                name: "LocalCompra",
                table: "Movimentacoes",
                type: "text",
                nullable: true);
        }

        /// <inheritdoc />
        protected override void Down(MigrationBuilder migrationBuilder)
        {
            migrationBuilder.DropColumn(
                name: "LocalCompra",
                table: "Movimentacoes");
        }
    }
}
