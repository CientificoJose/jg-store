import sqlite3
import json
import os
import sys

def main():
    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "productos.db")
    
    if not os.path.exists(db_path):
        print(json.dumps({
            "total_products": 0,
            "categories": [],
            "latest_products": [],
            "exists": False
        }))
        return

    try:
        conn = sqlite3.connect(db_path)
        cursor = conn.cursor()
        
        # Total productos
        cursor.execute("SELECT COUNT(*) FROM productos")
        total = cursor.fetchone()[0]
        
        # Categorias distintas
        cursor.execute("SELECT categoria, COUNT(*) FROM productos GROUP BY categoria ORDER BY COUNT(*) DESC")
        categories = [{"name": row[0] or "Sin categoría", "count": row[1]} for row in cursor.fetchall()]
        
        # Últimos 50 productos con estructura completa de precios y jerarquía
        cursor.execute("""
            SELECT codigo, codigo_barra, descripcion, precio, precio_costo, precio_minorista, precio_mayorista,
                   margen_minorista, margen_mayorista, precio_venta, porcentaje_ganancia, imagen_url, foto,
                   categoria, subcategoria, sub_subcategoria, categoria_ruta, peso_kg, ancho_cm, alto_cm, profundidad_cm 
            FROM productos 
            ORDER BY rowid DESC 
            LIMIT 50
        """)
        columns = [
            "codigo", "codigo_barra", "descripcion", "precio", "precio_costo", "precio_minorista", "precio_mayorista",
            "margen_minorista", "margen_mayorista", "precio_venta", "porcentaje_ganancia", "imagen_url", "foto",
            "categoria", "subcategoria", "sub_subcategoria", "categoria_ruta", "peso_kg", "ancho_cm", "alto_cm", "profundidad_cm"
        ]
        latest = [dict(zip(columns, row)) for row in cursor.fetchall()]
        
        conn.close()
        
        # File info
        stat = os.stat(db_path)
        
        print(json.dumps({
            "total_products": total,
            "categories": categories,
            "latest_products": latest,
            "last_modified": stat.st_mtime,
            "db_size_kb": round(stat.st_size / 1024, 2),
            "exists": True
        }, ensure_ascii=False))
    except Exception as e:
        print(json.dumps({
            "error": str(e),
            "total_products": 0,
            "categories": [],
            "latest_products": [],
            "exists": True
        }))

if __name__ == "__main__":
    main()
