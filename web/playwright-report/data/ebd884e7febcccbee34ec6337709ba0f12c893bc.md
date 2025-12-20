# Page snapshot

```yaml
- generic [active] [ref=e1]:
  - link "Skip to main content" [ref=e2] [cursor=pointer]:
    - /url: "#main-content"
  - button "Open Next.js Dev Tools" [ref=e8] [cursor=pointer]:
    - img [ref=e9]
  - alert [ref=e13]
  - main [ref=e14]:
    - generic [ref=e15]:
      - img [ref=e17]
      - paragraph [ref=e19]: Manage your sports team professionally
    - generic [ref=e22]:
      - img "TouchBase - Your dugout in the cloud" [ref=e24]
      - heading "TouchBase Login" [level=2] [ref=e26]
      - generic [ref=e27]:
        - generic [ref=e28]:
          - textbox "your@email.com" [ref=e30]: test@touchbase.com
          - textbox "Your password" [ref=e32]: TestPassword123!
        - generic [ref=e34]: Invalid email or password. Please try again.
        - button "Sign In" [ref=e36]
        - generic [ref=e37]:
          - paragraph [ref=e38]:
            - link "Forgot your password?" [ref=e39] [cursor=pointer]:
              - /url: /es/forgot-password
          - paragraph [ref=e40]:
            - text: First time?
            - link "Create an account" [ref=e41] [cursor=pointer]:
              - /url: /es/signup
```