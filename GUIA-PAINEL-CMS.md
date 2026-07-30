# Painel de conteúdo da Quatro Folhas

## Fluxo seguro de edição

1. Acesse `https://app.pagescms.org`.
2. Abra o repositório `quatro-site-publico`.
3. Selecione a branch `conteudo-revisao`.
4. Edite textos, cursos, aulas, imagens ou vídeos e salve normalmente.
5. As alterações ficam em revisão e não acionam o Render.
6. Depois da aprovação, use a ação **Publicar alterações aprovadas**.
7. Confirme em **Publicar agora**.

A publicação valida os arquivos e envia todo o conteúdo aprovado para a branch
`main` em um único passo. O Render inicia um único deploy automático.

## Regras importantes

- Não edite conteúdo diretamente na branch `main`.
- Use sempre `conteudo-revisao` para ajustes ainda não aprovados.
- Se a validação impedir a publicação, não force o processo. A branch de revisão
  precisa ser atualizada antes de tentar novamente.
- Excluir uma imagem que ainda está em uso pode deixá-la ausente no site.
