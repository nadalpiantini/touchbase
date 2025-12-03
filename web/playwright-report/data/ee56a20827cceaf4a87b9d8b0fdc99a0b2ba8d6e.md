# Page snapshot

```yaml
- generic [ref=e1]:
  - link "Skip to main content" [ref=e2]:
    - /url: "#main-content"
  - main [ref=e3]:
    - generic [ref=e5]:
      - button "Switch to English" [ref=e6]: EN
      - button "Switch to Spanish" [ref=e7]: ES
    - generic [ref=e8]:
      - generic [ref=e9]:
        - img "TouchBase - Your dugout in the cloud" [ref=e10]
        - heading "TouchBase Login" [level=2] [ref=e11]
        - paragraph [ref=e12]: Accede a tu sistema de gestión deportiva
      - generic [ref=e13]:
        - generic [ref=e14]:
          - generic [ref=e15]:
            - generic [ref=e16]: tu@email.com
            - textbox "tu@email.com" [active] [ref=e17]
          - generic [ref=e18]:
            - generic [ref=e19]: Tu contraseña
            - textbox "Tu contraseña" [ref=e20]: password123
        - button "Iniciar Sesión" [ref=e22]
        - paragraph [ref=e24]:
          - text: ¿Primera vez?
          - link "Crea una cuenta" [ref=e25]:
            - /url: /es/signup
  - button "Open Next.js Dev Tools" [ref=e31] [cursor=pointer]:
    - img [ref=e32]
  - alert [ref=e37]
```