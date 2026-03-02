import bpy
import bmesh
import math
import random

class BedGenerator:
    """Generates a luxury hotel-style bed matching the reference image:
    - Platform base with woven rattan front panel
    - Tall dark wood headboard with upholstered center
    - White draped duvet/comforter
    - 5 pillows: 2 grey back, 2 red middle, 1 green quilted accent
    """
    def __init__(self, name="Luxury_Bed", location=(0,0,0)):
        self.name = name
        self.loc = location
        self.width = 1.6
        self.length = 2.0
        self.base_h = 0.35  # Platform height
        
    # ---- Materials ----
    def mat(self, name, color, roughness=0.5, metallic=0.0, texture_type=None):
        if name in bpy.data.materials: return bpy.data.materials[name]
        m = bpy.data.materials.new(name=name)
        m.use_nodes = True
        N = m.node_tree.nodes; L = m.node_tree.links
        N.clear()
        bsdf = N.new("ShaderNodeBsdfPrincipled"); bsdf.location=(0,0)
        bsdf.inputs['Base Color'].default_value = color
        bsdf.inputs['Roughness'].default_value = roughness
        bsdf.inputs['Metallic'].default_value = metallic
        out = N.new("ShaderNodeOutputMaterial"); out.location=(300,0)
        L.new(bsdf.outputs['BSDF'], out.inputs['Surface'])
        
        if texture_type == 'wood':
            tc = N.new("ShaderNodeTexCoord"); tc.location=(-700,0)
            mp = N.new("ShaderNodeMapping"); mp.location=(-500,0)
            mp.inputs['Scale'].default_value = (8,1,1)
            ns = N.new("ShaderNodeTexNoise"); ns.location=(-300,0)
            ns.inputs['Scale'].default_value = 25.0; ns.inputs['Detail'].default_value = 12.0
            rp = N.new("ShaderNodeValToRGB"); rp.location=(-100,0)
            rp.color_ramp.elements[0].color = (color[0]*0.3, color[1]*0.3, color[2]*0.3, 1)
            rp.color_ramp.elements[1].color = color
            L.new(tc.outputs['Object'], mp.inputs['Vector'])
            L.new(mp.outputs['Vector'], ns.inputs['Vector'])
            L.new(ns.outputs['Fac'], rp.inputs['Fac'])
            L.new(rp.outputs['Color'], bsdf.inputs['Base Color'])
            bp = N.new("ShaderNodeBump"); bp.inputs['Strength'].default_value=0.1
            L.new(ns.outputs['Fac'], bp.inputs['Height'])
            L.new(bp.outputs['Normal'], bsdf.inputs['Normal'])
            
        elif texture_type == 'fabric':
            ns = N.new("ShaderNodeTexNoise"); ns.location=(-300,0)
            ns.inputs['Scale'].default_value = 600.0
            bp = N.new("ShaderNodeBump"); bp.inputs['Strength'].default_value=0.15; bp.location=(-100,-200)
            L.new(ns.outputs['Fac'], bp.inputs['Height'])
            L.new(bp.outputs['Normal'], bsdf.inputs['Normal'])
            
        return m

    def add_obj(self, prim, name, loc, scale, mat, **kw):
        """Helper to add a primitive object."""
        if prim == 'cube':
            bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
        elif prim == 'cyl':
            bpy.ops.mesh.primitive_cylinder_add(radius=kw.get('r',0.5), depth=kw.get('d',1), location=loc)
        elif prim == 'plane':
            bpy.ops.mesh.primitive_plane_add(size=1, location=loc)
        obj = bpy.context.active_object
        obj.name = f"{self.name}_{name}"
        obj.scale = scale
        if mat: obj.data.materials.append(mat)
        return obj

    # ---- Components ----
    def create_base(self):
        """Platform base - solid box with woven rattan front panel."""
        x,y,z = self.loc
        mat_wood = self.mat("Bed_DarkWood", (0.06, 0.025, 0.01, 1), 0.35, 0.0, 'wood')
        
        # Main platform
        base = self.add_obj('cube', 'Base', (x, y, z + self.base_h/2), 
                           (self.width/2, self.length/2, self.base_h/2), mat_wood)
        
        # Top molding/trim (thin strip on top edge)
        self.add_obj('cube', 'Base_Trim_Top', (x, y, z + self.base_h), 
                    (self.width/2 + 0.02, self.length/2 + 0.02, 0.015), mat_wood)
        
        # Bottom molding
        self.add_obj('cube', 'Base_Trim_Bot', (x, y, z + 0.03), 
                    (self.width/2 + 0.01, self.length/2 + 0.01, 0.015), mat_wood)
        
        # Front rattan/woven panel (recessed)
        mat_rattan = self.mat("Bed_Rattan", (0.15, 0.08, 0.03, 1), 0.7)
        rattan = self.add_obj('cube', 'Rattan_Panel', 
                             (x, y - self.length/2 + 0.01, z + self.base_h/2), 
                             (self.width/2 - 0.06, 0.01, self.base_h/2 - 0.05), mat_rattan)
        
        # Wireframe on rattan to simulate weave
        mod_sub = rattan.modifiers.new("Sub", 'SUBSURF'); mod_sub.levels = 2
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.subdivide(number_cuts=6)
        bpy.ops.object.mode_set(mode='OBJECT')

    def create_headboard(self):
        """Tall dark wood headboard with upholstered center panel."""
        x,y,z = self.loc
        hb_h = 1.0
        hb_z = z + self.base_h + hb_h/2
        hb_y = y + self.length/2
        
        mat_wood = self.mat("Bed_DarkWood", (0.06, 0.025, 0.01, 1), 0.35, 0.0, 'wood')
        
        # Main headboard frame
        hb = self.add_obj('cube', 'Headboard', (x, hb_y, hb_z), 
                         (self.width/2 + 0.05, 0.04, hb_h/2), mat_wood)
        # Bevel edges
        mod = hb.modifiers.new("Bevel", 'BEVEL')
        mod.width = 0.008; mod.segments = 2
        
        # Top crown/cap (slightly wider, arched effect)
        self.add_obj('cube', 'HB_Crown', (x, hb_y, hb_z + hb_h/2 + 0.02), 
                    (self.width/2 + 0.07, 0.05, 0.025), mat_wood)
        
        # Upholstered center panel (recessed, darker fabric)
        mat_uphol = self.mat("HB_Upholstery", (0.25, 0.22, 0.2, 1), 0.7, 0.0, 'fabric')
        panel = self.add_obj('cube', 'HB_Panel', (x, hb_y - 0.015, hb_z), 
                            (self.width/2 - 0.08, 0.025, hb_h/2 - 0.08), mat_uphol)
        # Slight puffiness
        mod_sub = panel.modifiers.new("Sub", 'SUBSURF'); mod_sub.levels = 2
        bpy.ops.object.shade_smooth()

    def create_bedding(self):
        """White duvet/comforter draped over the mattress."""
        x,y,z = self.loc
        mat_z = z + self.base_h
        
        # Mattress (hidden under duvet but gives volume)
        mat_white = self.mat("Bed_White_Linen", (0.92, 0.90, 0.85, 1), 0.8, 0.0, 'fabric')
        
        mattress = self.add_obj('cube', 'Mattress', (x, y, mat_z + 0.12), 
                               (self.width/2 - 0.03, self.length/2 - 0.03, 0.12), mat_white)
        mod = mattress.modifiers.new("Sub", 'SUBSURF'); mod.levels = 2
        bpy.ops.object.shade_smooth()
        
        # Duvet/Comforter (slightly larger, drapes over edges)
        duvet = self.add_obj('cube', 'Duvet', (x, y - 0.05, mat_z + 0.22), 
                            (self.width/2 + 0.04, self.length/2 - 0.15, 0.06), mat_white)
        
        # Subdivide for organic drape
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.subdivide(number_cuts=4)
        bpy.ops.object.mode_set(mode='OBJECT')
        
        mod_sub = duvet.modifiers.new("Sub", 'SUBSURF'); mod_sub.levels = 2
        
        # Displacement for wrinkles
        tex_name = "Duvet_Wrinkle"
        if tex_name not in bpy.data.textures:
            tex = bpy.data.textures.new(tex_name, 'CLOUDS')
            tex.noise_scale = 0.8
        else:
            tex = bpy.data.textures[tex_name]
        mod_disp = duvet.modifiers.new("Disp", 'DISPLACE')
        mod_disp.texture = tex; mod_disp.strength = 0.03
        
        bpy.ops.object.shade_smooth()
        
        # Fold-over at top (tucked sheet look)
        fold = self.add_obj('cube', 'Sheet_Fold', (x, y + self.length/2 - 0.45, mat_z + 0.28), 
                           (self.width/2 + 0.03, 0.08, 0.02), mat_white)
        mod = fold.modifiers.new("Sub", 'SUBSURF'); mod.levels = 2
        bpy.ops.object.shade_smooth()

    def create_pillow(self, suffix, loc, scale, rot, color):
        """Creates a realistic pillow matching the reference:
        - Puffy inflated center
        - Flat pinched seam edges
        - Rounded rectangular silhouette
        Uses direct bmesh vertex manipulation for precise control.
        """
        import mathutils
        
        # 1. Create base cube at origin, apply scale, then move
        bpy.ops.mesh.primitive_cube_add(size=1, location=(0,0,0))
        p = bpy.context.active_object
        p.name = f"{self.name}_Pillow_{suffix}"
        p.scale = scale
        bpy.ops.object.transform_apply(scale=True)
        
        # 2. Subdivide heavily for smooth deformation
        bpy.ops.object.mode_set(mode='EDIT')
        bpy.ops.mesh.subdivide(number_cuts=5)  # 5 cuts = dense mesh
        bpy.ops.object.mode_set(mode='OBJECT')
        
        # 3. Direct vertex sculpting with bmesh
        me = p.data
        bm = bmesh.new()
        bm.from_mesh(me)
        bm.verts.ensure_lookup_table()
        
        # Get bounds
        xs = [v.co.x for v in bm.verts]
        ys = [v.co.y for v in bm.verts]
        zs = [v.co.z for v in bm.verts]
        xmin, xmax = min(xs), max(xs)
        ymin, ymax = min(ys), max(ys)
        zmin, zmax = min(zs), max(zs)
        xsize = xmax - xmin; ysize = ymax - ymin; zsize = zmax - zmin
        
        for v in bm.verts:
            # Normalized coords 0..1
            nx = (v.co.x - xmin) / xsize if xsize > 0 else 0.5
            ny = (v.co.y - ymin) / ysize if ysize > 0 else 0.5
            nz = (v.co.z - zmin) / zsize if zsize > 0 else 0.5
            
            # Distance from center on XY plane (0 at edge, 1 at center)
            dx = 1.0 - abs(nx - 0.5) * 2.0
            dy = 1.0 - abs(ny - 0.5) * 2.0
            
            # Smooth falloff using cosine curve (more natural than linear)
            fx = (math.cos((1.0 - dx) * math.pi) + 1.0) / 2.0  # 0 at edge, 1 at center
            fy = (math.cos((1.0 - dy) * math.pi) + 1.0) / 2.0
            
            # Combined inflate factor (multiplicative for nice corner falloff)
            inflate = fx * fy
            
            # Inflate: push top verts up, bottom verts down
            # The amount depends on how centered the vertex is in XY
            inflate_amount = zsize * 0.35  # How much to puff
            
            if nz > 0.5:
                # Top face vertices: push up
                push = inflate * inflate_amount * (nz - 0.5) * 2.0
                v.co.z += push
            elif nz < 0.5:
                # Bottom face vertices: push down
                push = inflate * inflate_amount * (0.5 - nz) * 2.0
                v.co.z -= push
            
            # Pinch edges: vertices near the XY border get squeezed in Z
            edge_factor = 1.0 - inflate  # High at edges, 0 at center
            if edge_factor > 0.3:
                # Squish Z toward center plane
                z_center = (zmin + zmax) / 2.0
                squeeze = edge_factor * 0.6  # How much to flatten edges
                v.co.z = v.co.z * (1.0 - squeeze) + z_center * squeeze
            
            # Round the corners in XY (pull corners inward slightly)
            corner_dist = (1.0 - dx) * (1.0 - dy)  # High at corners
            if corner_dist > 0.5:
                cx = (xmin + xmax) / 2.0
                cy = (ymin + ymax) / 2.0
                pull = (corner_dist - 0.5) * 0.3
                v.co.x = v.co.x * (1.0 - pull) + cx * pull
                v.co.y = v.co.y * (1.0 - pull) + cy * pull
        
        bm.to_mesh(me)
        bm.free()
        me.update()
        
        # 4. Subsurf for final smoothness
        msub = p.modifiers.new("Smooth", 'SUBSURF')
        msub.levels = 2; msub.render_levels = 3
        
        # 5. Very subtle displacement for fabric texture
        tex_fabric = f"FabricBump_{suffix}"
        if tex_fabric not in bpy.data.textures:
            t = bpy.data.textures.new(tex_fabric, 'NOISE')
        else:
            t = bpy.data.textures[tex_fabric]
        md = p.modifiers.new("FabricBump", 'DISPLACE')
        md.texture = t; md.strength = 0.005; md.mid_level = 0.5
        
        bpy.ops.object.shade_smooth()
        
        # 6. Set final position and rotation
        p.location = loc
        p.rotation_euler = rot
        
        # Material
        mat = self.mat(f"Pillow_{suffix}", color, 0.85, 0.0, 'fabric')
        p.data.materials.append(mat)
        return p

    # ---- Build ----
    def build(self):
        self.create_base()
        self.create_headboard()
        self.create_bedding()
        
        x,y,z = self.loc
        pz = z + self.base_h + 0.3  # Pillow base Z (on top of mattress)
        py = y + self.length/2 - 0.35 # Near headboard
        
        r = lambda a: math.radians(a)
        rnd = lambda lo, hi: random.uniform(lo, hi)
        
        # Back Row: 2 Large Grey/Beige pillows leaning on headboard
        self.create_pillow("Grey_L", 
            (x - 0.4, py, pz + 0.12), (0.38, 0.12, 0.3), 
            (r(20 + rnd(-2,2)), 0, r(rnd(-2,2))), (0.7, 0.68, 0.65, 1))
        self.create_pillow("Grey_R", 
            (x + 0.4, py, pz + 0.12), (0.38, 0.12, 0.3), 
            (r(20 + rnd(-2,2)), 0, r(rnd(-2,2))), (0.7, 0.68, 0.65, 1))
        
        # Middle Row: 2 Red/Maroon pillows
        self.create_pillow("Red_L", 
            (x - 0.35, py - 0.18, pz + 0.05), (0.32, 0.1, 0.25), 
            (r(12 + rnd(-3,3)), 0, r(rnd(-3,3))), (0.45, 0.06, 0.06, 1))
        self.create_pillow("Red_R", 
            (x + 0.35, py - 0.18, pz + 0.05), (0.32, 0.1, 0.25), 
            (r(12 + rnd(-3,3)), 0, r(rnd(-3,3))), (0.45, 0.06, 0.06, 1))
        
        # Front: 1 Green Quilted accent pillow
        self.create_pillow("Green_Accent", 
            (x, py - 0.3, pz), (0.28, 0.08, 0.2), 
            (r(8 + rnd(-4,4)), 0, r(rnd(-4,4))), (0.12, 0.35, 0.28, 1))


# ---- Scene Setup ----
def setup_scene():
    # Key light (warm, from above-front)
    bpy.ops.object.light_add(type='AREA', location=(1, -3, 3))
    kl = bpy.context.active_object
    kl.data.energy = 400; kl.data.size = 3
    kl.data.color = (1, 0.95, 0.9)
    kl.rotation_euler = (math.radians(55), 0, math.radians(15))
    
    # Fill light (cool, from left)
    bpy.ops.object.light_add(type='AREA', location=(-2, 0, 2))
    fl = bpy.context.active_object
    fl.data.energy = 100; fl.data.size = 2
    fl.data.color = (0.9, 0.92, 1.0)
    
    # Camera
    bpy.ops.object.camera_add(location=(0, -3.2, 1.8), rotation=(math.radians(72), 0, 0))
    bpy.context.scene.camera = bpy.context.active_object

if __name__ == "__main__":
    if bpy.context.active_object and bpy.context.active_object.mode == 'EDIT':
        bpy.ops.object.mode_set(mode='OBJECT')
    bpy.ops.object.select_all(action='SELECT')
    bpy.ops.object.delete()
    
    gen = BedGenerator()
    gen.build()
    setup_scene()
