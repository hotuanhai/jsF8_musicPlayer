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