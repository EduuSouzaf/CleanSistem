namespace Pdv.Api.Models;

public class WebAuthnCredential
{
    public int Id { get; set; }
    public string CredentialId { get; set; } = string.Empty;
    public string PublicKey { get; set; } = string.Empty;
    public uint SignCount { get; set; }
    public DateTime CreatedAt { get; set; }
}
