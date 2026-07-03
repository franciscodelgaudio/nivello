# Deploy do Nivello na Oracle Cloud (Always Free — ARM Ampere)

Guia completo para rodar o app num container Docker numa VM ARM Ampere A1
(gratuita e permanente). A imagem é **buildada na própria VM** (arm64 nativo),
com **Caddy** fazendo HTTPS automático via Let's Encrypt.

> Pré-requisito: uma conta na Oracle Cloud (o cadastro pede cartão de crédito
> só para verificação — recursos **Always Free** não são cobrados). Você
> também precisa de um **domínio** apontando para o IP da VM. Sem domínio dá
> para testar com `sslip.io` (ver passo 6).

---

## 1. Criar a VM (Instance) ARM Ampere

No console da Oracle: **Menu ▸ Compute ▸ Instances ▸ Create instance**.

- **Image:** Canonical **Ubuntu 24.04** (Minimal serve).
- **Shape:** clique em *Change shape ▸ Ampere ▸ `VM.Standard.A1.Flex`*.
  Ajuste para **2 OCPU / 12 GB** (ou até 4 / 24 — o teto do Always Free). 2/12
  já é bastante folga para este app.
- **SSH keys:** faça upload da sua chave pública, ou deixe gerar e **salve a
  privada**.
- **Networking:** deixe criar uma VCN nova; **marque "Assign a public IPv4
  address"**.
- Create.

> ⚠️ Se aparecer **"Out of host capacity"**, é a limitação conhecida da ARM no
> free tier. Tente: outra *Availability Domain* no formulário, outra região, ou
> repita mais tarde. Também dá para criar via CLI num loop — mas normalmente
> tentar em horário diferente resolve.

Anote o **IP público** da instância quando ela ficar *Running*.

## 2. Liberar as portas 80 e 443 (Security List)

**VCN ▸ Subnet ▸ Default Security List ▸ Add Ingress Rules**, e adicione duas
regras (uma por porta):

| Source CIDR | IP Protocol | Destination Port |
|-------------|-------------|------------------|
| `0.0.0.0/0` | TCP         | `80`             |
| `0.0.0.0/0` | TCP         | `443`            |

## 3. Conectar por SSH e abrir o firewall interno

As imagens Ubuntu da Oracle vêm com `iptables` bloqueando quase tudo — abrir só
na Security List **não basta**.

```bash
ssh ubuntu@SEU_IP_PUBLICO

# Libera 80/443 no firewall do sistema (antes da regra REJECT padrão)
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 80 -j ACCEPT
sudo iptables -I INPUT 6 -m state --state NEW -p tcp --dport 443 -j ACCEPT
sudo netfilter-persistent save
```

## 4. Instalar Docker

```bash
curl -fsSL https://get.docker.com | sudo sh
sudo usermod -aG docker $USER
sudo systemctl enable --now docker
# Reentre no SSH para o grupo 'docker' valer (ou rode: newgrp docker)
exit
```

Reconecte: `ssh ubuntu@SEU_IP_PUBLICO`.

## 5. Clonar o repositório

```bash
# Repo privado: use um Personal Access Token ou uma deploy key.
git clone https://github.com/triad-solucoes-inteligentes/nivello.git
cd nivello/deploy
```

## 6. Configurar o domínio (DNS)

Crie um registro **A** no seu provedor de DNS:

```
tipo A   nome @ (ou app)   valor SEU_IP_PUBLICO   TTL 300
```

**Sem domínio próprio?** Use `sslip.io`: se o IP for `203.0.113.25`, o host
`203-0-113-25.sslip.io` já resolve para ele e o Let's Encrypt emite certificado
normalmente. Bom para testar (o Google OAuth exige HTTPS, e o LE não emite
certificado para IP puro).

## 7. Preencher as variáveis de ambiente

```bash
cp env.example .env
nano .env
```

Preencha:

- `MONGODB_URI` — string de conexão do MongoDB Atlas (o Network Access do Atlas
  já está em `0.0.0.0/0`).
- `AUTH_SECRET` — gere com `openssl rand -base64 32`.
- `GOOGLE_ID` / `GOOGLE_SECRET` — do Google Cloud Console.
- `AUTH_URL` — `https://SEU_DOMINIO` (exatamente igual ao domínio).
- `DOMAIN` — o mesmo domínio, **sem** `https://`.
- `ACME_EMAIL` — seu e-mail (avisos de expiração do certificado).

> No Google Cloud Console, adicione em **Authorized redirect URIs**:
> `https://SEU_DOMINIO/api/auth/callback/google`.

## 8. Subir a stack

```bash
docker compose up -d --build
```

O primeiro build leva alguns minutos (build nativo arm64). Acompanhe:

```bash
docker compose logs -f
```

Quando o Caddy obtiver o certificado, abra **https://SEU_DOMINIO** 🎉

---

## Atualizar (deploy de nova versão)

```bash
cd ~/nivello/deploy
chmod +x update.sh   # só na primeira vez
./update.sh          # git pull + rebuild + restart + limpeza
```

## Comandos úteis

```bash
docker compose ps            # status dos containers
docker compose logs -f app   # logs só do app
docker compose restart app   # reinicia o app
docker compose down          # derruba a stack (mantém os volumes/certs)
```

## Notas

- **Boot:** `restart: unless-stopped` + `systemctl enable docker` garantem que
  a stack sobe sozinha se a VM reiniciar.
- **Segredos:** ficam só no `.env` da VM (gitignored) e entram no container em
  runtime — nunca são embutidos na imagem.
- **Voltar ao modelo "imagem pronta do GHCR":** possível, mas para ARM exigiria
  build multi-arch no CI (lento via QEMU). Buildar na VM é mais simples e rápido.
