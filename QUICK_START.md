# 🚀 GUIA RÁPIDO - Integração com API

## ✅ O que foi feito?

Seu frontend React agora está **100% integrado** com seu backend!

---

## 📁 ARQUIVOS NOVOS

```
✨ src/services/api.js       → Todas as chamadas à API
✨ .env                       → URL da API
✨ .env.example              → Template
✨ .gitignore                → Ignorar node_modules e .env
✨ API_INTEGRATION.md        → Documentação completa
```

---

## 🔄 ARQUIVOS MODIFICADOS

### 1️⃣ **Login** (`src/pages/Login.jsx`)
```javascript
// ❌ ANTES: Simulado
navigate('/dashboard')

// ✅ AGORA: API Real
const response = await authAPI.login(email, password)
localStorage.setItem('token', response.access_token)
navigate('/dashboard')
```

### 2️⃣ **Cadastro** (`src/pages/Signup.jsx`)
```javascript
// ✅ Cria usuário via API
await authAPI.register(userData)
// ✅ Faz login automático
```

### 3️⃣ **Dashboard** (`src/pages/Dashboard.jsx`)
```javascript
// ❌ ANTES: Dados mockados
import { mockProjects } from '../data/mockData'

// ✅ AGORA: Busca da API
const projects = await projectAPI.getAll()
```

### 4️⃣ **Novo Projeto** (`src/pages/NewProject.jsx`)
```javascript
// ✅ Cria projeto na API
const newProject = await projectAPI.create(formData)
navigate(`/project/${newProject.id}`)
```

### 5️⃣ **Perfil** (`src/pages/Profile.jsx`)
```javascript
// ✅ Carrega dados do usuário
const profile = await userAPI.getProfile()
// ✅ Atualiza perfil
await userAPI.updateProfile(data)
// ✅ Altera senha
await userAPI.changePassword(old, new)
```

### 6️⃣ **Sidebar** (`src/components/Sidebar.jsx`)
```javascript
// ✅ Logout remove token
authAPI.logout()
navigate('/')
```

---

## 🔑 Como Funciona a Autenticação?

```
1. Login/Cadastro
   ↓
2. Backend retorna TOKEN
   ↓
3. Token salvo no localStorage
   ↓
4. Todas requisições incluem: 
   Authorization: Bearer {token}
   ↓
5. Backend valida e retorna dados
```

---

## 🧪 Como Testar?

### **1. Login**
```bash
1. Abra /login
2. Digite credenciais válidas
3. F12 → Application → Local Storage
4. Verifique se tem "token"
```

### **2. Projetos**
```bash
1. Acesse /dashboard
2. Verifique se carrega projetos da API
3. Crie novo projeto
4. Veja se aparece na lista
```

### **3. Perfil**
```bash
1. Acesse /profile
2. Altere nome/email
3. Verifique se salvou na API
```

---

## 📋 Checklist de Integração

- [x] Sistema de login conectado
- [x] Sistema de registro conectado
- [x] Dashboard carrega projetos da API
- [x] Criar projeto via API
- [x] Perfil carrega dados da API
- [x] Atualizar perfil via API
- [x] Alterar senha via API
- [x] Logout limpa token
- [x] Token enviado em todas requisições
- [x] Tratamento de erros
- [x] Loading states

---

## 🔧 Configuração Necessária

### **1. Instalar dependências**
```bash
npm install
```

### **2. Configurar .env (já está pronto!)**
```bash
VITE_API_URL=https://projetointeligente.onrender.com
```

### **3. Rodar**
```bash
npm run dev
```

---

## 🌐 URL da API

**Backend:** https://projetointeligente.onrender.com
**Docs:** https://projetointeligente.onrender.com/docs

---

## 📞 Problemas Comuns

### **Erro de CORS**
→ Backend precisa permitir requisições do frontend
→ Verifique configuração CORS no backend

### **401 Unauthorized**
→ Token expirou ou inválido
→ Faça login novamente

### **Token não está sendo enviado**
→ Verifique localStorage
→ Veja se authAPI.login salvou o token

---

## 📚 Documentação Completa

Veja `API_INTEGRATION.md` para:
- Todos os endpoints disponíveis
- Exemplos de uso de cada função
- Estrutura de dados esperada
- Tratamento de erros avançado

---

## ✨ Pronto para Deploy!

Seu projeto está 100% funcional e integrado.

Para publicar:
1. **Vercel**: `vercel`
2. **Netlify**: Arraste pasta `dist/`
3. **GitHub Pages**: `npm run deploy`

🎉 **Parabéns! Integração completa!**
