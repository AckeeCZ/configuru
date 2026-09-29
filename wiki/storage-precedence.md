## Config storage precedence

Configuration is merged from three sources with override priorities as described in the following diagram.

![x](https://www.plantuml.com/plantuml/svg/0/VP4zJyD038Rt-nLM9XWITiHGAGnyI7HWOZpkdFPeOXy-En8IFvvBcw7jmFhQVfvNygQe5xLfTEMGA7ln4qnC7FR24uAAeND36X6QY8EtKI4m3MdNW2yGrv4LbFFSNF0I8Gi7BAL3cfSqEqUi299sUmKUwldZohofDJI5MtXvtxwjfCwz8cP8j72-C2Wiij8vf0WBw1fdhhUYFC6npXrKRHAc2KalkJsJ-aG52WP1BS1IWTIUIbHZDlt7azq7crpWPo_9VnxRFNcAFp1KvBUbS02UKIH5N2JzyparmiDlsuBTGmEmNTTAu-oKv-jyKq_hf_u0 'x')

Environment variables are applied only for keys declared in the default config. A variable whose key is missing from the default config is ignored, even if the key is present in the user config or in the loader schema. See [Environment variables](./advanced-usage.md#environment-variables).

:warning: All storage sources are regarded as flat structures. Nested objects are not merged.
