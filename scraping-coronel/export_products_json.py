import sqlite3
import json
import os
import sys
import argparse

def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--category", default=None, help="Filtrar por categoría")
    parser.add_argument("--limit", type=int, default=None, help="Límite de productos")
    args = parser.parse_args()

    base_dir = os.path.dirname(os.path.abspath(__file__))
    db_path = os.path.join(base_dir, "productos.db")
    
    if not os.path.exists(db_path):
        print(json.dumps([]))
        return

    try:
        conn = sqlite3.connect(db_path)
        conn.row_factory = sqlite3.Row
        cursor = conn.cursor()
        
        query = """
            SELECT codigo, codigo_barra, descripcion, precio, precio_costo, precio_minorista, precio_mayorista,
                   margen_minorista, margen_mayorista, precio_venta, porcentaje_ganancia, imagen_url, foto,
                   categoria, subcategoria, sub_subcategoria, categoria_ruta,
                   categoria_slug, subcategoria_slug, sub_subcategoria_slug,
                   categoria_niveles, nivel_profundidad, stock
            FROM productos
        """
        params = []
        if args.category and args.category != "all":
            query += " WHERE categoria = ? OR categoria_slug = ?"
            params.extend([args.category, args.category])
            
        query += " ORDER BY rowid ASC"
        if args.limit:
            query += " LIMIT ?"
            params.append(args.limit)
            
        cursor.execute(query, params)
        rows = [dict(r) for r in cursor.fetchall()]
        conn.close()
        
        print(json.dumps(rows, ensure_ascii=False))
    except Exception as e:
        sys.stderr.write(f"Error exportando productos: {str(e)}\n")
        print(json.dumps([]))

if __name__ == "__main__":
    main()
