import bpy
import bmesh
import math
import random

def clear_scene():
    """Clears all objects from the scene to start fresh."""
    if bpy.context.active_object and bpy.context.active_object.mode == 'EDIT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()

def create_pbr_material(name, color, roughness=0.5, metallic=0.0, texture_type=None, emission=None):
    """Creates a PBR material with optional procedural textures."""
    if name in bpy.data.materials: return bpy.data.materials[name]
    
    mat = bpy.data.materials.new(name=name)
    mat.use_nodes = True
    nodes = mat.node_tree.nodes
    links = mat.node_tree.links
    
    # Clear default nodes
    nodes.clear()
    
    # Create Principled BSDF
    bsdf = nodes.new(type="ShaderNodeBsdfPrincipled")
    bsdf.location = (0, 0)
    bsdf.inputs['Base Color'].default_value = color
    bsdf.inputs['Roughness'].default_value = roughness
    bsdf.inputs['Metallic'].default_value = metallic
    
    # Emission
    if emission:
         bsdf.inputs['Emission Color'].default_value = color
         bsdf.inputs['Emission Strength'].default_value = emission

    # Output
    output = nodes.new(type="ShaderNodeOutputMaterial")
    output.location = (300, 0)
    links.new(bsdf.outputs['BSDF'], output.inputs['Surface'])
    
    # Add procedural texture if requested
    if texture_type == 'fabric':
        # Noise Texture for bump
        noise = nodes.new(type="ShaderNodeTexNoise")
        noise.inputs['Scale'].default_value = 500.0
        noise.location = (-400, 200)
        
        bump = nodes.new(type="ShaderNodeBump")
        bump.inputs['Strength'].default_value = 0.2
        bump.location = (-200, -200)
        
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])
        
    elif texture_type == 'wood':
        # Voronoi for wood grain
        tex_coord = nodes.new(type="ShaderNodeTexCoord")
        mapping = nodes.new(type="ShaderNodeMapping")
        mapping.inputs['Scale'].default_value = (10, 1, 1) # Stretch for grain
        mapping.location = (-600, 0)
        tex_coord.location = (-800, 0)

        noise = nodes.new(type="ShaderNodeTexNoise")
        noise.inputs['Scale'].default_value = 20.0
        noise.inputs['Detail'].default_value = 10.0
        noise.location = (-400, 0)
        
        color_ramp = nodes.new(type="ShaderNodeValToRGB")
        color_ramp.location = (-200, 0)
        # Darker wood gradient
        c1 = (color[0]*0.4, color[1]*0.4, color[2]*0.4, 1)
        c2 = color
        color_ramp.color_ramp.elements[0].color = c1
        color_ramp.color_ramp.elements[1].color = c2
        
        links.new(tex_coord.outputs['Object'], mapping.inputs['Vector'])
        links.new(mapping.outputs['Vector'], noise.inputs['Vector'])
        links.new(noise.outputs['Fac'], color_ramp.inputs['Fac'])
        links.new(color_ramp.outputs['Color'], bsdf.inputs['Base Color'])
        
        # Bump for grain
        bump = nodes.new(type="ShaderNodeBump")
        bump.inputs['Strength'].default_value = 0.1
        bump.location = (-200, -200)
        links.new(noise.outputs['Fac'], bump.inputs['Height'])
        links.new(bump.outputs['Normal'], bsdf.inputs['Normal'])

    return mat

def add_bevel(obj, width=0.01, segments=3):
    """Adds a bevel modifier to an object for realism."""
    mod = obj.modifiers.new("Bevel", 'BEVEL')
    mod.width = width
    mod.segments = segments
    mod.limit_method = 'ANGLE'
    mod.angle_limit = math.radians(30)
    bpy.ops.object.shade_smooth()

def create_lattice_panel(name, loc, dims):
    # 1. Outer Frame (Dark Wood)
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    frame = bpy.context.active_object
    frame.name = name + "_Frame"
    frame.dimensions = dims
    add_bevel(frame, width=0.005)
    
    mat_dark_wood = create_pbr_material("Dark_Wood", (0.05, 0.02, 0.01, 1), roughness=0.3, texture_type='wood')
    frame.data.materials.append(mat_dark_wood)
    
    # 2. Lattice Pattern (Intricate CNC look)
    # Create plane slightly recessed
    pattern_dims = (dims[0]-0.2, dims[2]-0.2, 0)
    bpy.ops.mesh.primitive_plane_add(size=1, location=(loc[0], loc[1]-0.02, loc[2])) # Slightly closer to wall
    lattice = bpy.context.active_object
    lattice.name = name + "_Pattern"
    lattice.dimensions = pattern_dims
    lattice.rotation_euler = (math.radians(90), 0, 0)
    
    # Subdivide for grid
    bpy.ops.object.mode_set(mode='EDIT')
    bpy.ops.mesh.subdivide(number_cuts=10) # Finer grid
    bpy.ops.object.mode_set(mode='OBJECT')
    
    # Modifiers: Decimate (Diamond) -> Wireframe -> Solidify -> Bevel
    mod_dec = lattice.modifiers.new("Decimate", 'DECIMATE')
    mod_dec.decimate_type = 'UNSUBDIV'
    mod_dec.iterations = 1
    
    mod_wire = lattice.modifiers.new("Wireframe", 'WIREFRAME')
    mod_wire.thickness = 0.015
    mod_wire.use_replace = True
    
    # Give depth to the lattice
    mod_solid = lattice.modifiers.new("Solidify", 'SOLIDIFY')
    mod_solid.thickness = 0.01
    
    add_bevel(lattice, width=0.002, segments=2)
    
    lattice.data.materials.append(mat_dark_wood)

def create_bed(name, loc):
    # Base Frame
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    bed = bpy.context.active_object
    bed.name = name + "_Frame"
    bed.dimensions = (1.8, 2.2, 0.4) 
    add_bevel(bed, width=0.01)
    mat_wood = create_pbr_material("Dark_Wood", (0.05, 0.02, 0.01, 1), roughness=0.3, texture_type='wood')
    bed.data.materials.append(mat_wood)
    
    # Mattress (with slight softness)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1], loc[2]+0.35))
    mattress = bpy.context.active_object
    mattress.name = name + "_Mattress"
    mattress.dimensions = (1.7, 2.1, 0.25)
    
    # Round corners for mattress
    mod_sub = mattress.modifiers.new("Subsurf", 'SUBSURF')
    mod_sub.levels = 2
    bpy.ops.object.shade_smooth()
    
    mat_white = create_pbr_material("White_Fabric", (0.95, 0.95, 0.95, 1), roughness=0.9, texture_type='fabric')
    mattress.data.materials.append(mat_white)
    
    # Headboard (Statement Piece)
    bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1] + 1.1, loc[2] + 0.8))
    headboard = bpy.context.active_object
    headboard.name = name + "_Headboard"
    headboard.dimensions = (1.9, 0.15, 1.3)
    add_bevel(headboard, width=0.02)
    headboard.data.materials.append(mat_wood)
    
    # Upholstered Panel on Headboard
    bpy.ops.mesh.primitive_cube_add(size=1, location=(loc[0], loc[1] + 1.05, loc[2] + 0.8))
    hb_cushion = bpy.context.active_object
    hb_cushion.dimensions = (1.7, 0.1, 1.1)
    
    # Tufting effect (simplified with texture/subsurf)
    mod_sub_hb = hb_cushion.modifiers.new("Subsurf", 'SUBSURF')
    mod_sub_hb.levels = 2
    bpy.ops.object.shade_smooth()
    
    mat_velvet = create_pbr_material("Velvet_Grey", (0.2, 0.2, 0.25, 1), roughness=0.6, texture_type='fabric')
    hb_cushion.data.materials.append(mat_velvet)
    
    # Luxurious Pillows
    colors = [
        ((0.6, 0.1, 0.1, 1), "Red_Velvet"), 
        ((0.15, 0.15, 0.15, 1), "Black_Silk"), 
        ((0.9, 0.9, 0.9, 1), "White_Cotton")
    ]
    
    # 2 Large back pillows
    for i in range(2):
        x_pos = loc[0] - 0.5 + (i * 1.0)
        bpy.ops.mesh.primitive_cube_add(size=0.5, location=(x_pos, loc[1] + 0.9, loc[2] + 0.6))
        pillow = bpy.context.active_object
        pillow.scale = (1.2, 0.6, 1.0)
        pillow.rotation_euler = (math.radians(-15), 0, 0) # Lean back
        mod_sub = pillow.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = 2
        bpy.ops.object.shade_smooth()
        mat_pillow = create_pbr_material(f"Pillow_Back_{i}", (0.8, 0.8, 0.8, 1), roughness=0.8, texture_type='fabric')
        pillow.data.materials.append(mat_pillow)

    # 3 Accent pillows in front
    for i in range(3):
        x_pos = loc[0] - 0.4 + (i * 0.4)
        bpy.ops.mesh.primitive_cube_add(size=0.4, location=(x_pos, loc[1] + 0.7, loc[2] + 0.55))
        pillow = bpy.context.active_object
        pillow.scale = (0.8, 0.4, 0.8)
        pillow.rotation_euler = (math.radians(-10), random.uniform(-0.1, 0.1), random.uniform(-0.1, 0.1)) # Natural look
        
        mod_sub = pillow.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = 2
        bpy.ops.object.shade_smooth()
        
        color, name_suffix = colors[i % 3] # Fixed missing variable
        mat_pillow = create_pbr_material(name_suffix, color, roughness=0.8, texture_type='fabric')
        pillow.data.materials.append(mat_pillow)


def create_room():
    # Room Shell
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 0, 1.5))
    room = bpy.context.active_object
    room.name = "Room_Shell"
    room.scale = (8, 6, 3) 
    
    # Flip normals for interior
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
    
    # Gold leaf material (Metallic + slightly rough)
    mat_gold = create_pbr_material("Gold_Leaf", (0.9, 0.7, 0.2, 1), metallic=0.8, roughness=0.3)
    gold_wall.data.materials.append(mat_gold)

    # Lattice Panels (Left, Center, Right)
    create_lattice_panel("Lattice_Center", (0, 2.9, 1.5), (1.2, 0.1, 3.0))
    create_lattice_panel("Lattice_Left", (-3.0, 2.9, 1.5), (1.0, 0.1, 3.0))
    create_lattice_panel("Lattice_Right", (3.0, 2.9, 1.5), (1.0, 0.1, 3.0))

    # Beds (Twin beds setup typical for cruise cabins)
    create_bed("Bed_Left", (-1.8, 0.5, 0.2)) # Moved forward a bit
    create_bed("Bed_Right", (1.8, 0.5, 0.2))
    
    # Nightstand between beds
    bpy.ops.mesh.primitive_cube_add(size=1, location=(0, 2.2, 0.4))
    table = bpy.context.active_object
    table.dimensions = (0.7, 0.6, 0.6)
    add_bevel(table, width=0.01)
    mat_dark_wood = bpy.data.materials.get("Dark_Wood")
    table.data.materials.append(mat_dark_wood)
    
    # Lamp
    bpy.ops.mesh.primitive_cylinder_add(radius=0.1, depth=0.4, location=(0, 2.2, 0.8))
    base = bpy.context.active_object
    base.data.materials.append(mat_dark_wood)
    
    bpy.ops.mesh.primitive_cone_add(radius1=0.3, radius2=0.15, depth=0.35, location=(0, 2.2, 1.15))
    shade = bpy.context.active_object
    mat_lamp = create_pbr_material("Lamp_Shade_On", (1, 0.95, 0.8, 1), emission=5.0) 
    shade.data.materials.append(mat_lamp)

    # Light point inside lamp
    bpy.ops.object.light_add(type='POINT', location=(0, 2.2, 1.0))
    lamp_light = bpy.context.active_object
    lamp_light.data.energy = 50
    lamp_light.data.color = (1, 0.9, 0.7)

    # Window Curtains (Left wall)
    for x in [-3.9]:
        bpy.ops.mesh.primitive_plane_add(size=1, location=(x, -0.5, 1.5))
        drape = bpy.context.active_object
        drape.scale = (2.0, 4.0, 2.8)
        drape.rotation_euler = (0, math.radians(90), math.radians(90))
        
        # Cloth simulation look (Sine wave displacement)
        mod_sub = drape.modifiers.new("Subsurf", 'SUBSURF')
        mod_sub.levels = 4
        
        # Simple displacement texture
        if "Drape_Wave" in bpy.data.textures:
            tex = bpy.data.textures["Drape_Wave"]
        else:
            tex = bpy.data.textures.new("Drape_Wave", 'WOOD')
            tex.noise_scale = 0.5
        
        mod_disp = drape.modifiers.new("Displace", 'DISPLACE')
        mod_disp.texture = tex
        mod_disp.strength = 0.2
        mod_disp.direction = 'Z' # Local Z after rotation
        
        bpy.ops.object.shade_smooth()
        mat_curtain = create_pbr_material("Curtain_Sheer", (0.9, 0.9, 0.95, 1), roughness=0.5)
        # Set transmission for sheer look (needs cycles/eevee settings enabled)
        mat_curtain.node_tree.nodes["Principled BSDF"].inputs['Transmission Weight'].default_value = 0.7
        drape.data.materials.append(mat_curtain)

    # Lighting Setup
    # Main ambient fill
    bpy.ops.object.light_add(type='AREA', location=(0, -2, 2.8))
    main_light = bpy.context.active_object
    main_light.data.energy = 300
    main_light.data.size = 4
    main_light.data.color = (1, 0.98, 0.95)
    
    # Warm accent (Simulate sunset/lamp warmth)
    bpy.ops.object.light_add(type='AREA', location=(3, 0, 1.5))
    fill_light = bpy.context.active_object
    fill_light.rotation_euler = (0, math.radians(45), 0)
    fill_light.data.energy = 150
    fill_light.data.color = (1, 0.8, 0.6)

    # Camera
    bpy.ops.object.camera_add(location=(0, -6, 1.4), rotation=(math.radians(90), 0, 0))
    cam = bpy.context.active_object
    bpy.context.scene.camera = cam

if __name__ == "__main__":
    clear_scene()
    create_room()
