## Usage
```
curl -X GET -H "UserID: BEN" "https://code-club-3-5-user-profiles.benjamin-tran25.workers.dev/profile"
```

## Test Users
❯ wrangler kv:key put --binding=USER_AUTH "A123" "45hnb"

❯ wrangler kv:key put --binding=USER_AUTH "BEN" "e92f463d-67e7-4d2b-a3cd-627d7a2098f8"

❯ wrangler kv:key put --binding=USER_AUTH "KIRK" "d231aa0f-34f7-4eb8-ae22-80e733a8da16"

❯ wrangler kv:key put --binding=USER_AUTH "B234" "7426ca06-f4f3-4fbe-80af-16a141135706"

❯ wrangler kv:key put --binding=USER_AUTH "C345" "78837eff-e343-43c2-ad4a-956ec16a1fa8"

❯ wrangler kv:key put --binding=USER_AUTH "D456" "fff65305-b7c5-492f-8c4e-7301a99849c1"