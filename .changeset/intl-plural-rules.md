---
'@translaas/models': minor
'@translaas/caching-file': minor
---

Use Intl.PluralRules (CLDR) for plural category resolution in PluralResolver and offline CachingTranslaasClient GetEntry. Removes getPattern and exported determinePluralCategory (one/other). Offline plural selection is now locale-aware; live HTTP still sends n to the server.
