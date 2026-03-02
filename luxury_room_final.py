import bpy
import bmesh
import math
import sys
import os

# Ensure the script directory is in sys.path to allow imports
script_dir = os.path.dirname(bpy.data.filepath) if bpy.data.filepath else os.path.dirname(os.path.abspath(__file__))
if script_dir not in sys.path:
    sys.path.append(script_dir)

try:
    from bed import BedGenerator
    from window_curtain import CurtainGenerator
except ImportError:
    print("Could not import modules. Ensure bed.py and window_curtain.py are in the same directory.")
    # Fallback or exit? For now just print error, Blender console will show it.

def clear_scene():
    if bpy.context.active_object and bpy.context.active_object.mode == 'EDIT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def create_pbr_material(name, color, roughness=0.5, metallic=0.0):
    if name in bpy.data.materials: return bpy.data.materials[name]
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    bsdf = mat.node_tree.nodes["Principled BSDF"]
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    return mat

def create_room_shell():
    # Room Shell
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
    room = bpy.context.active_object
    room.name = "Room_Shell"
    room.scale = (8, 6, 3) 
    
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.flip_normals()
    bpy.ops.object.mode_set(mode='OBJECT')
    
    mat_wall = create_pbr_material("Wall_Cream", (0.95, 0.92, 0.85, 1), roughness=0.8)
    room.data.materials.append(mat_wall)

    # Feature Wall (Gold Wallpaper)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 2.95, 1.5))
    gold_wall = bpy.context.active_object
    gold_wall.name = "Feature_Wall_Gold"
    gold_wall.rotation_euler = (math.radians(90), 0, 0)
    gold_wall.scale = (7.9, 2.9, 1)
    
    mat_gold = create_pbr_material("Gold_Leaf", (0.9, 0.7, 0.2, 1), metallic=0.8, roughness=0.3)
    gold_wall.data.materials.append(mat_gold)

    # Floor
    bpy.ops.mesh.primitive_plane_add(size=1, location=(0, 0, 0.01))
    floor = bpy.context.active_object
    floor.name = "Floor_Carpet"
    floor.scale = (7.8, 5.8, 1)
    mat_carpet = create_pbr_material("Carpet_Beige", (0.8, 0.75, 0.7, 1), roughness=1.0)
    floor.data.materials.append(mat_carpet)

def create_lattice_panel(name, loc, dims):
    # Simplified version or reuse logic? 
    # Let's keep it simple here as it wasn't extracted to a class
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    frame = bpy.context.active_object
    frame.name = name + "_Frame"
    frame.dimensions = dims
    
    mat_dark = create_pbr_material("Dark_Wood_Panel", (0.05, 0.02, 0.01, 1), roughness=0.3)
    frame.data.materials.append(mat_dark)
    
    # Inner pattern placeholder
    bpy.ops.mesh.primitive_plane_add(size=1, location=(loc[0], loc[1]-0.02, loc[2]))
    inner = bpy.context.active_object
    inner.scale = (dims[0]-0.2, dims[2]-0.2, 1)
    inner.rotation_euler = (math.radians(90), 0, 0)
    
    # Wireframe modifier for lattice look
    mod = inner.modifiers.new("Wireframe", 'WIREFRAME')
    mod.thickness = 0.02
    inner.data.materials.append(mat_dark)

def build_scene():
    clear_scene()
    create_room_shell()
    
    # Lattice Panels
    create_lattice_panel("Lattice_Center", (0, 2.9, 1.5), (1.2, 0.1, 3.0))
    create_lattice_panel("Lattice_Left", (-3.0, 2.9, 1.5), (1.0, 0.1, 3.0))
    create_lattice_panel("Lattice_Right", (3.0, 2.9, 1.5), (1.0, 0.1, 3.0))
    
    # BEDS (Using imported class)
    # Left Bed
    bed_l = BedGenerator(name="Bed_Left", location=(-1.8, 0.5, 0.0))
    bed_l.build()
    
    # Right Bed
    bed_r = BedGenerator(name="Bed_Right", location=(1.8, 0.5, 0.0))
    bed_r.build()
    
    # Nightstand between beds
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.2, 0.4))
    table = bpy.context.active_object
    table.dimensions = (0.7, 0.6, 0.6)
    mat_dark = bpy.data.materials.get("Bed_Dark_Wood") # Reuse material from bed
    if mat_dark: table.data.materials.append(mat_dark)
    
    # Lamp
    bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.4, location=(0, 2.2, 0.8))
    base = bpy.context.active_object
    if mat_dark: base.data.materials.append(mat_dark)
    
    bpy.ops.mesh.primitive_cone_add(radius1=0.3, radius2=0.15, depth=0.35, location=(0, 2.2, 1.15))
    shade = bpy.context.active_object
    mat_lamp = create_pbr_material("Lamp_Shade_On", (1, 0.95, 0.8, 1)) 
    shade.data.materials.append(mat_lamp)
    
    # CURTAINS (Using imported class)
    # Left Window
    # Window is at x=-4 approx
    curtain = CurtainGenerator(name="Window_Curtain", location=(-3.9, 0, 0.1), width=3.0, height=2.8)
    curtain.build()

    # Lighting
    bpy.ops.object.light_add(type='AREA', location=(0, -2, 2.8))
    main_light = bpy.context.active_object
    main_light.data.energy = 400
    main_light.data.size = 5
    
    # Camera
    bpy.ops.object.camera_add(location=(0, -5, 1.6), rotation=(math.radians(90), 0, 0))
    bpy.context.scene.camera = bpy.context.active_object

if __name__ == "__main__":
    build_scene()
