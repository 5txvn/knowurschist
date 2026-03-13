import fitz  # PyMuPDF
import re
import os
from pathlib import Path

def process_physics_pdfs(folder_path):
    # Iterate through all files in the directory
    for filename in os.listdir(folder_path):
        if filename.lower().endswith(".pdf"):
            
            # --- Filename Parsing Logic ---
            # 1. Remove "_Sci_" and replace with a hyphen
            clean_name = filename.replace("_Sci_", "-")
            
            # 2. Remove everything after the first space (e.g., " (UIL C)")
            # Path(clean_name).stem gets the name without the .pdf extension
            base_name = Path(clean_name).stem.split(' ')[0]
            
            print(f"Processing: {filename} -> Base Name: {base_name}")
            
            # --- Extraction Logic ---
            pdf_path = os.path.join(folder_path, filename)
            doc = fitz.open(pdf_path)
            
            for page_index in range(len(doc)):
                page = doc[page_index]
                
                # Identify Physics markers
                question_markers = []
                text_instances = page.get_text("dict")["blocks"]
                
                for block in text_instances:
                    if "lines" in block:
                        for line in block["lines"]:
                            for span in line["spans"]:
                                match = re.match(r'(P\d+)\.', span["text"].strip())
                                if match:
                                    question_markers.append({
                                        "id": match.group(1).lower(), # e.g., 'p7'
                                        "y": span["origin"][1]
                                    })

                if not question_markers:
                    continue

                images = page.get_images(full=True)
                img_info_list = page.get_image_info(xrefs=True)

                for img in images:
                    xref = img[0]
                    img_info = next((i for i in img_info_list if i["xref"] == xref), None)
                    if not img_info: continue
                    
                    img_y = img_info["bbox"][1]
                    
                    # Logic: Map image to the closest PRECEDING question marker
                    current_label = None
                    question_markers.sort(key=lambda x: x["y"])
                    
                    for marker in question_markers:
                        if marker["y"] < img_y:
                            current_label = marker["id"]
                        else:
                            break

                    if current_label and current_label.startswith("p"):
                        base_image = doc.extract_image(xref)
                        
                        q_number = current_label[1:]
                        new_filename = f"../physics/temp-images/{base_name}-q{q_number}.{base_image['ext']}"
                        
                        with open(new_filename, "wb") as f:
                            f.write(base_image["image"])
                            print(f"  -> Saved: {new_filename}")

            doc.close()

process_physics_pdfs(r"C:\Users\SL Surface Pro\Downloads\Science-20260309T143931Z-1-001\Science\2022-2023")