
function Mesh() {

    this.name = "";
    this.vertices = [];
    this.faces = [];
    this.faceMaterialIds = [];
    this.normals = [];
    this.uvs = [[]];
    this.materials = [];

    this.depthMaterial = null;

    this.position = new THREE.Vector3();
    this.size = new THREE.Vector3(1, 1, 1);

    return this;
}

function save() {

}

function model(meshes) {

    this.mesh = [];
    this.name = "";
    this.modelData = {

    }

    this.addMeshes = function (meshes) {

        if(!meshes.length) meshes = [meshes]

        for (var i = 0; i < meshes.length; i++) {
            this.mesh.push(meshes[i]);
        }
    }

    if (meshes) this.addMeshes(meshes);

    return this;
}

var currentModel = new model();

function addInput(parent,mesh, id){

    var wrapper = document.createElement("div");
    wrapper.innerText = mesh.name;
    wrapper.id = "mesh_" + id;

    var input = document.createElement("input");
    input.setAttribute("type", "text");

    input.value = mesh.name;
    wrapper.appendChild(input);

    for (var i = 0; i < mesh.material.length; i++) {
        var input = document.createElement("input");
        input.setAttribute("type", "text");

        input.value = mesh.material[i].name
        wrapper.appendChild(input);
    }

    return wrapper;

}

function setUi() {
    var menu = $(".menu")

    var title = document.createElement("input");
    title.setAttribute("type", "text");
    title.className = "title";
    title.value = "name this";
    
    menu[0].appendChild(title);

    for (var i = 0; i < currentModel.mesh.length; i++) {
        var mesh = currentModel.mesh[i];
        var mUi = addInput(menu, mesh, i)
        menu[0].appendChild(mUi);

    }

}

function createMesh(data, name) {
    var m = new THREE.Mesh(data.geometry, data.materials);
    m.name = name;
    return m;
}

var counter = 0;

function readAndLoadJson(file, length, name) {
    var reader = new FileReader();

    reader.onload = function (event) {
        debugger;

        var json = JSON.parse(event.target.result);

        currentModel.addMeshes(createMesh(new THREE.JSONLoader().parse(json), name));

        if (counter === length - 1) {
            setUi();
            
        }
        else {
            counter++;
        }
    }

    reader.readAsText(file);
}


$(".save-btn").click(function (event) {

    debugger;
    var meshes = [];

    for (var i = 0; i < currentModel.mesh.length; i++) {
        var isGlas = false;

        for (var j = 0; j < currentModel.mesh[i].material.length; j++) {

            if (currentModel.mesh[i].material[j].name.toLowerCase().indexOf("glas") > -1) {
                isGlas = true;
                break;
            }
        }

        var depthMaterial = isGlas ? "depthAlphaMaterial" : null;
        var m = meshToJson(currentModel.mesh[i], depthMaterial);
        meshes.push(m)
    }


    console.log(meshes)
    //var file = JSON.stringify(currentModel)

})


$(".load").change(function (event) {


    for (var i = 0; i < event.target.files.length; i++) {
        readAndLoadJson(event.target.files[i], event.target.files.length, event.target.files[i].name.split(".")[0]);
    }
   
  

})

function meshToJson(mesh, depthMaterial) {

    var g = mesh.geometry;

    var m = new Mesh();
    m.name = mesh.name;

    for (var v = 0; v < g.vertices.length; v++) {

        var vert = g.vertices[v];

        m.vertices.push(vert.x, vert.y, vert.z);
    }

    for (var f = 0; f < g.faces.length; f++) {

        var face = g.faces[f];

        m.faceMaterialIds.push(face.materialIndex || 0);
        m.faces.push(face.a, face.b, face.c);

        for (i = 0; i < 3; i++) {


            if (face.vertexNormals && face.vertexNormals.length > 0) {
                normal = face.vertexNormals[i]

                m.normals.push(normal.x, normal.y, normal.z);
            }
            else {
                m.normals.push(face.normal.x, face.normal.y, face.normal.z);
            }
        }
    }

    for (var u = 0; u < g.faceVertexUvs[0].length; u++) {

        var uv = g.faceVertexUvs[0][u];

        for (var i = 0; i < uv.length; i++) {
            m.uvs[0].push(uv[i].x, uv[i].y);
        }
    }

    //Parse materials

    for (var i = 0; i < mesh.material.length; i++) {

        m.materials.push(mesh.material[i].name + ".json");
    }

    m.position = mesh.position.clone();
    m.size = mesh.scale.clone();
    m.depthMaterial = depthMaterial; //Depthmaterial is a string used to get the right depth 

    return m;
}