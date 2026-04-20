# search_docs

Search DietMate documentation pages by keyword.

## Input

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| query | string | yes | Search keyword or phrase |

## Output

Array of matching pages, each with `title`, `url`, and `section`.

## Example

```json
{ "query": "登入" }
```

Returns pages whose title or section contains the keyword.
