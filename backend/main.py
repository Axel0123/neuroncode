from fastapi import FastAPI, HTTPException, Depends, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordRequestForm, OAuth2PasswordBearer
from fastapi.responses import StreamingResponse
from passlib.context import CryptContext
from jose import JWTError, jwt
import sqlite3
from pydantic import BaseModel
from datetime import datetime, timedelta
import subprocess
import uuid
from fpdf import FPDF
from io import BytesIO

SECRET_KEY = "codepulse_secret"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 30

app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="login")

conn = sqlite3.connect("users.db", check_same_thread=False)
cursor = conn.cursor()
cursor.execute('''CREATE TABLE IF NOT EXISTS users (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT UNIQUE,
                    password TEXT)''')
cursor.execute('''CREATE TABLE IF NOT EXISTS executions (
                    id INTEGER PRIMARY KEY AUTOINCREMENT,
                    username TEXT,
                    code TEXT,
                    output TEXT,
                    timestamp TEXT)''')
cursor.execute('''CREATE TABLE IF NOT EXISTS shared (
                    id TEXT PRIMARY KEY,
                    code TEXT,
                    output TEXT,
                    timestamp TEXT)''')
conn.commit()

class User(BaseModel):
    username: str
    password: str

class Token(BaseModel):
    access_token: str
    token_type: str

def create_access_token(data: dict, expires_delta: timedelta = None):
    to_encode = data.copy()
    expire = datetime.utcnow() + (expires_delta or timedelta(minutes=15))
    to_encode.update({"exp": expire})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def verify_password(plain_password, hashed_password):
    return pwd_context.verify(plain_password, hashed_password)

def get_password_hash(password):
    return pwd_context.hash(password)

def authenticate_user(username: str, password: str):
    user = get_user(username)
    if not user or not verify_password(password, user["password"]):
        return False
    return user

def get_user(username: str):
    cursor.execute("SELECT * FROM users WHERE username=?", (username,))
    row = cursor.fetchone()
    if row:
        return {"id": row[0], "username": row[1], "password": row[2]}
    return None

def sugerencias_codigo(code: str):
    suggestions = []
    if "for" in code and "range" in code and "[" in code and "]" in code:
        suggestions.append("Puedes usar list comprehensions para mejorar el rendimiento.")
    if "eval(" in code:
        suggestions.append("Evita usar eval(); puede ser un riesgo de seguridad.")
    if "def " in code and code.count("def ") > 1:
        suggestions.append("Considera agrupar funciones relacionadas en una clase.")
    if "print" in code and "input" in code:
        suggestions.append("Tu código podría beneficiarse de una interfaz más estructurada (como funciones).")
    if "=" in code:
        lines = code.split("\n")
        assigned = [line.split("=")[0].strip() for line in lines if "=" in line and "==" not in line]
        unused = [var for var in assigned if var and code.count(var) == 1]
        if unused:
            suggestions.append("Variables no utilizadas detectadas: " + ", ".join(unused))
    if not suggestions:
        suggestions.append("\u00a1Buen trabajo! No se encontraron recomendaciones.")
    return suggestions

@app.post("/register")
def register(user: User):
    if get_user(user.username):
        raise HTTPException(status_code=400, detail="Username already registered")
    hashed_password = get_password_hash(user.password)
    cursor.execute("INSERT INTO users (username, password) VALUES (?, ?)", (user.username, hashed_password))
    conn.commit()
    return {"message": "User registered successfully"}

@app.post("/login", response_model=Token)
def login(form_data: OAuth2PasswordRequestForm = Depends()):
    user = authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(status_code=400, detail="Incorrect username or password")
    access_token = create_access_token(data={"sub": user["username"]}, expires_delta=timedelta(minutes=30))
    return {"access_token": access_token, "token_type": "bearer"}

@app.get("/me")
def read_users_me(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
        if username is None:
            raise HTTPException(status_code=401, detail="Invalid token")
        return {"username": username}
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

@app.post("/run-code")
async def run_code(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    data = await request.json()
    code = data.get("code", "")
    try:
        result = subprocess.run(["python", "-c", code], capture_output=True, text=True, timeout=5)
        suggestions = sugerencias_codigo(code)
        return {"output": result.stdout or result.stderr, "suggestions": suggestions}
    except Exception as e:
        return {"output": f"Error: {str(e)}", "suggestions": []}

@app.post("/save-execution")
async def save_execution(request: Request, token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    data = await request.json()
    code = data.get("code")
    output = data.get("output")
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")

    cursor.execute("INSERT INTO executions (username, code, output, timestamp) VALUES (?, ?, ?, ?)",
                   (username, code, output, timestamp))
    conn.commit()
    return {"message": "Execution saved"}

@app.get("/history")
def get_history(token: str = Depends(oauth2_scheme)):
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        username = payload.get("sub")
    except JWTError:
        raise HTTPException(status_code=401, detail="Invalid token")

    cursor.execute("SELECT id, code, output, timestamp FROM executions WHERE username=? ORDER BY id DESC", (username,))
    rows = cursor.fetchall()
    return [{"id": r[0], "code": r[1], "output": r[2], "timestamp": r[3]} for r in rows]

@app.post("/share")
async def share_code(request: Request):
    data = await request.json()
    code = data.get("code")
    output = data.get("output")
    share_id = str(uuid.uuid4())[:8]
    timestamp = datetime.now().strftime("%Y-%m-%d %H:%M:%S")
    cursor.execute("INSERT INTO shared (id, code, output, timestamp) VALUES (?, ?, ?, ?)",
                   (share_id, code, output, timestamp))
    conn.commit()
    return {"id": share_id, "url": f"http://localhost:5173/shared/{share_id}"}

@app.get("/share/{share_id}")
def get_shared_code(share_id: str):
    cursor.execute("SELECT code, output, timestamp FROM shared WHERE id = ?", (share_id,))
    row = cursor.fetchone()
    if row:
        return {
            "code": row[0],
            "output": row[1],
            "timestamp": row[2]
        }
    raise HTTPException(status_code=404, detail="Código compartido no encontrado")

@app.post("/explain-code")
async def explain_code(request: Request):
    data = await request.json()
    code = data.get("code")
    explanation = f"Este código hace lo siguiente:\n\n{code[:300]}\n\n(Explicación simulada - IA próximamente)"
    return {"explanation": explanation}

class PDF(FPDF):
    def header(self):
        self.set_font('Arial', 'B', 14)
        self.set_text_color(30, 144, 255)
        self.cell(0, 10, 'CodePulse – Reporte de Ejecución', ln=True, align='C')
        self.set_draw_color(200, 200, 200)
        self.line(10, 20, 200, 20)
        self.ln(5)

    def footer(self):
        self.set_y(-15)
        self.set_font('Arial', 'I', 9)
        self.set_text_color(150)
        self.cell(0, 10, f'Página {self.page_no()}', align='C')

@app.post("/export-pdf")
async def export_pdf_endpoint(request: Request):
    data = await request.json()
    code = data.get("code", "")
    output = data.get("output", "")
    suggestions = data.get("suggestions", [])

    pdf = PDF()
    pdf.add_page()
    pdf.set_auto_page_break(auto=True, margin=15)

    pdf.set_font("Arial", 'B', 12)
    pdf.set_text_color(0)
    pdf.cell(0, 10, f"Fecha de exportación: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}", ln=True)
    pdf.ln(4)

    pdf.set_font("Courier", size=10)
    pdf.set_fill_color(245, 245, 245)
    pdf.set_text_color(33, 37, 41)
    pdf.set_draw_color(200, 200, 200)
    pdf.cell(0, 10, "💻 Código:", ln=True, fill=False)
    pdf.multi_cell(0, 6, code, border=1, fill=True)
    pdf.ln(4)

    pdf.set_font("Arial", 'B', 11)
    pdf.set_text_color(0)
    pdf.cell(0, 10, "✅ Salida:", ln=True)
    pdf.set_font("Courier", size=10)
    pdf.multi_cell(0, 6, output, border=1, fill=False)
    pdf.ln(4)

    if suggestions:
        pdf.set_font("Arial", 'B', 11)
        pdf.cell(0, 10, "💡 Sugerencias aplicadas:", ln=True)
        pdf.set_font("Arial", '', 10)
        for s in suggestions:
            pdf.multi_cell(0, 6, f"- {s}", border=0)
    else:
        pdf.set_font("Arial", 'I', 10)
        pdf.cell(0, 10, "No se aplicaron sugerencias.", ln=True)

    pdf_buffer = BytesIO()
    pdf.output(pdf_buffer)
    pdf_buffer.seek(0)

    return StreamingResponse(pdf_buffer, media_type="application/pdf", headers={
        "Content-Disposition": "attachment; filename=codepulse_reporte.pdf"
    })


