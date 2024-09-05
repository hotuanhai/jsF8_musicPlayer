// fetch albums
var albumApi = "http://localhost:3000/albums"
function getAllAlbums(){
    return fetch(albumApi)
        .then(function(res){
            return res.json()
        })
        .then(function(albums){
            return albums
        })
}
export default getAllAlbums 

function getAllAlbumsName() {
    return getAllAlbums().then(function(albums) {
        return albums.map(album => album.name);
    });
}
export {getAllAlbumsName}

function deleteAlbum(id){
    var options = {
        method : `DELETE`,
        headers: {
            "Content-Type": "application/json",
          }
    }
    fetch(`${albumApi}/${id}`,options)
        .then(function(res){
            res.json()
        })
        .then(function(){
            
        })
}
export {deleteAlbum}

function createAlbum(data,callback){
    var options = {
        method : `POST`,
        body: JSON.stringify(data),
        headers: {
            "Content-Type": "application/json",
          }
    }
    fetch(albumApi,options)
        .then(function(res){
            return res.json()
        })
        .then(callback)
}
export {createAlbum}

function updateAlbum(id, data, callback) {
    var options = {
        method: 'PUT',
        body: JSON.stringify(data),
        headers: {
            'Content-Type': 'application/json',
        },
    };

    fetch(`${albumApi}/${id}`, options)
        .then(function (res) {
            return res.json()
        })
        .then(callback)
}

export { updateAlbum }

function getAlbumByName(name, callback) {
    getAllAlbums()
        .then(function (albums) {
            const album = albums.find(album => album.name === name)
            callback(album)
        });
}

export { getAlbumByName }