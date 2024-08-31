import songs from './assets/songsList/songs.js'
import generateRandomArray from './utils.js'
import getAllAlbums,{getAllAlbumsName,deleteAlbum} from './controller/albumController.js'

const $ = document.querySelector.bind(document)
const $$ = document.querySelectorAll.bind(document)

const PLAYER_STORAGE_KEY = 'F8_PLAYER'

const player = $('.player')
const playlist = $('.playlist')
const cd = $('.cd')
const heading = $('header h2')
const cdThumb = $('.cd-thumb')
const audio = $('#audio')
const playBtn = $('.btn-toggle-play')
const progress = $('#progress')
const nextBtn = $('.btn-next')
const prevBtn = $('.btn-prev')
const randomBtn = $('.btn-random')
const repeatBtn = $('.btn-repeat')
const dashboard = $('.dashboard')
//volume
const volumeBtn = $('.btn-volume')
const volumeBar = $('#volume-bar')
const volumeBarContainer = $('.volumeBar-container')
const iconVolumeOff = $('.fa-volume-off')
const iconVolumeLow = $('.fa-volume-low')
const iconVolumeHigh = $('.fa-volume-high')
// album
const albumMenuBtn = $('.btn-albumMenu')
const albumList = $('.albumList')
const albumOption = $('.albumOption')

const app = {
    curIndex: 0,
    isPlaying: false,
    isSeeking: false,
    isRandom: false,
    isRepeat: false,
    randomArr: [],
    randomArrCurIndex: 0,
    curAlbumName: 'All song',
    curAlbumlist:[],
    volume: 0.05,
    config: JSON.parse(localStorage.getItem(PLAYER_STORAGE_KEY)) || {},
    songs,
    setConfig: function(key,value){
        this.config[key] = value
        localStorage.setItem(PLAYER_STORAGE_KEY,JSON.stringify(this.config))
    },
    render: function(){
        const htmls = this.songs.map((song,index) => {
            return`
                <div class="song ${index === this.curIndex ? 'active' : ''}" data-index="${index}">
                    <div class="thumb" style="background-image: url('${song.image}')">
                    </div>
                    <div class="body">
                        <h3 class="title">${song.name}</h3>
                        <p class="author">${song.singer}</p>
                    </div>
                    <div class="option">
                        <i class="fas fa-ellipsis-h"></i>
                    </div>
                </div>
            `
        })
        playlist.innerHTML = htmls.join('')
    },
    renderAlbumsName:async function(){
        const albums = await getAllAlbums() 
        const html = `  <div class="album">
                            <div> All song </div>
                        </div>`
        albumList.innerHTML =  html             
        const htmls = albums.map((album,index) => {
            return`
                <div class="album">
                    <div> ${album.name} </div>
                </div>
            `
        })
        albumList.innerHTML += htmls.join('')
    },
    defineProperties: function(){
        Object.defineProperty(this,'curSong',{
            get : function(){
                return this.songs[this.curIndex]
            }
        }),
        Object.defineProperty(this,'volume',{
            get : function(){
                return audio.volume
            },
            set: function(value) {
                audio.volume = value;
                this.setConfig('volume', value);
            }
        })//,
        // Object.defineProperty(this, 'albumsName', {
        //     get: function() {
        //         return getAllAlbumsName().then(names => names);
        //     }
        // })
    },
    handleEvents: function(){
        const _this = this

        //rotate CD when play / stop
        const cdThumbAnimate = cdThumb.animate([
            {transform: 'rotate(360deg)'}
        ],{
            duration: 50000,
            iteration: Infinity 
        })
        cdThumbAnimate.pause()

        //set width,height of cd img when scrolling
        const cdWidth = cd.offsetWidth
        document.onscroll = function(){
            const scrollTop = window.scrollY || document.documentElement.scrollTop
            const newCDWidth = cdWidth - scrollTop/3
            cd.style.width = newCDWidth > 0 ? newCDWidth + 'px' : 0
            cd.style.opacity = newCDWidth/cdWidth
        }
        // handle pause / play btn
        playBtn.onclick = function(){
            if(_this.isPlaying){            
                audio.pause()
            }else{           
                audio.play()
            }
        }

        //handle play
        audio.onplay = function(){
            _this.isPlaying = true
            player.classList.add(`playing`)
            //rotate CD
            cdThumbAnimate.play()
        }
        //handle pause
        audio.onpause = function(){
            _this.isPlaying = false
            player.classList.remove(`playing`)
            //rotate CD
            cdThumbAnimate.pause()
        }
        // update the progress bar 
        audio.ontimeupdate = function(){
            if(!_this.isSeeking && audio.duration){
                const progressPercent = Math.floor(audio.currentTime / audio.duration *100)
                progress.value = progressPercent
            }
        }
        //tua
        //isSeeking to handle confict of oninput-onchange and ontimeupdate
        progress.oninput = function(e) {
            _this.isSeeking = true; 
        }
        progress.onchange = function(e) {
            const seekTime = e.target.value / 100 * audio.duration;
            audio.currentTime = seekTime;
            _this.isSeeking = false; // 
        }
        
        //handle next/prev btn
        nextBtn.onclick = function(){
            if(_this.isRandom){
                if(_this.randomArrCurIndex === (_this.songs.length - 1)){
                    _this.randomArrCurIndex = 0
                }else{
                    _this.randomArrCurIndex++
                }                
                _this.playRandom()
            }else{
                _this.nextSong()
            }  
            audio.play()
        }
        prevBtn.onclick = function(){
            if(_this.isRandom){
                if(_this.randomArrCurIndex === 0){
                    _this.randomArrCurIndex = (_this.songs.length - 1)
                }else{
                    _this.randomArrCurIndex--
                }   
                _this.playRandom()
            }else{
                _this.prevSong()
            }            
            audio.play()
        }

        //handle random next song
        //problem: make the posibility of next song equal
        randomBtn.onclick = function(){
            _this.isRandom = !_this.isRandom
            randomBtn.classList.toggle('active',_this.isRandom)

            //reset the random songs list if randomBtn is double clicked   
            if(!_this.isRepeat){_this.randomArr = []}
            //update state in local storage
            _this.setConfig('isRandom',_this.isRandom)
        }

        // next/ repeat song when the audio is finished
        //repeat song when finish
        repeatBtn.onclick = function(){
            _this.isRepeat = !_this.isRepeat
            repeatBtn.classList.toggle('active',_this.isRepeat)

            //update state in local storage
            _this.setConfig('isRepeat',_this.isRepeat)
        }
        //next song when finish
        audio.onended = function(){
            if(_this.isRepeat){
                audio.play()
            }else{
                nextBtn.click()
            }
        }

        //handle click to chose song
        playlist.onclick = function(e){
            //check if click in '.song' area
            const songNode = e.target.closest('.song:not(.active)')
            if(songNode || e.target.closest('.option')){
                if(songNode && !e.target.closest('.option')){
                    _this.curIndex = songNode.getAttribute('data-index')
                    _this.loadCurSong()
                    audio.play()
                }
                if(e.target.closest('.option')){
                }
            }
        }

        //handle volume
        volumeBtn.onclick = function(){
            volumeBarContainer.classList.add('active')
            // volumeBarContainer.focus()
            console.log(`${dashboard.getBoundingClientRect().bottom - 100} ` +'px')
            volumeBarContainer.style.top = `${dashboard.getBoundingClientRect().bottom - 158}` +'px'
        }
        // volumeBarContainer.onblur = function(){
        //     volumeBarContainer.classList.remove('active')
        // }
        document.addEventListener('click', function(e) {
            const isClickInside = volumeBtn.contains(e.target) || volumeBarContainer.contains(e.target);
            if (!isClickInside) {
                volumeBarContainer.classList.remove('active');
            }
        })
        document.addEventListener('scroll', function(){
            volumeBarContainer.classList.remove('active')
        })

        volumeBar.oninput = function(e) {
            _this.volume = e.target.value / 100; 
            //set the volume to config
            _this.setConfig('volume',_this.volume)
            //set the icon of volume
            _this.loadCurVolumeIcon()
        }

        //handle album
        albumMenuBtn.onclick = async function() {
            await _this.renderAlbumsName()
        
            albumList.classList.add('active')
            // Wait for the next animation frame to ensure rendering is complete
            await new Promise(requestAnimationFrame) 
        
            // fix the css
            const albumWidth = albumList.getBoundingClientRect().width
            const albumHeight = albumList.getBoundingClientRect().height
            const dashboardBottom = dashboard.getBoundingClientRect().bottom
            albumList.style.top = `${dashboardBottom - albumHeight/2 - 50}px`
            albumList.style.right = `-${albumWidth}px`
        }

        albumList.onclick = function(e) {
            const album = e.target.closest('.album')
            if (album) {
                albumOption.classList.add(`active`) 
                albumOption.setAttribute('parent', album.innerText)
                const albumBottom = album.getBoundingClientRect().bottom
                const albumRight = album.getBoundingClientRect().right
                const albumWidth = album.getBoundingClientRect().width
                const albumHeight = album.getBoundingClientRect().height
                const dashboardRight = dashboard.getBoundingClientRect().right
                albumOption.style.right =` -${albumRight - dashboardRight + albumWidth +16}px`
                albumOption.style.top = `${albumBottom - albumHeight*1.5}px`
            }
        }
        albumOption.onclick = function(e){
            console.log(albumOption.getAttribute('parent'))
            if(e.target.innerText === 'Chọn album'){        
                _this.handleChosingAlbum(albumOption.getAttribute('parent'))
            }else if(e.target.innerText === 'Xóa album'){
                _this.handleDeleteAlbum(albumOption.getAttribute('parent'))
            }
            
        }
        document.addEventListener('click', function(e) {
            if (!albumList.contains(e.target) && !albumMenuBtn.contains(e.target)) {
                albumList.classList.remove('active')
                albumOption.classList.remove('active') 
            }
        });
        document.addEventListener('scroll', function() {
            albumList.classList.remove('active')
            albumOption.classList.remove('active') 
        })
    },
    scrollToActiveSong: function(){
        setTimeout(()=>{
            $('.song.active').scrollIntoView({
                behavior: 'smooth',
                block: 'nearest'
            })
            // see element hidden by dashboard
            const dashboardBottom = dashboard.getBoundingClientRect().bottom
            const activeSongTop = $('.song.active').getBoundingClientRect().bottom - $('.song.active').offsetHeight

            if(activeSongTop < dashboardBottom){
               window.scrollBy({
                    behavior: "smooth",
                    top:- dashboardBottom + activeSongTop - 200 ,
                    
                })
            }
        },50)
        
    },
    loadCurSong: function(){
        heading.textContent = this.curSong.name
        cdThumb.style.backgroundImage = `url('${this.curSong.image}')`
        audio.src = this.curSong.path

        //add active class to curSong
        const prevActive = $('.song.active')
        if (prevActive) {
            prevActive.classList.remove('active')
        }
        const newActive = $(`.song[data-index="${this.curIndex}"]`)
        if (newActive) {
            newActive.classList.add('active')
        }

        //set the current song to config
        this.setConfig('curIndex',this.curIndex)
        
        //scroll To Active Song : scroll into view
        this.scrollToActiveSong()
    },
    loadCurVolumeIcon: function(){
        //set the icon of volume
        const curVolumeIcon = $('.btn-volume .active:not(.volumeBar-container)')
        if(this.volume < 0.11){
            if(curVolumeIcon !== iconVolumeOff){
                curVolumeIcon.classList.remove('active')
                iconVolumeOff.classList.add('active')
            }
        }else if(this.volume > 0.89){
            if(curVolumeIcon !== iconVolumeHigh){
                curVolumeIcon.classList.remove('active')
                iconVolumeHigh.classList.add('active')
            }
        }else{
            if(curVolumeIcon !== iconVolumeLow){
                curVolumeIcon.classList.remove('active')
                iconVolumeLow.classList.add('active')
            }
        }
    },
    loadConfig: function(){
        this.isRandom = this.config.isRandom 
        this.isRepeat = this.config.isRepeat
        this.curIndex = this.config.curIndex ? this.config.curIndex : 0
        //handle volume
        this.volume = this.config.volume ? this.config.volume : 0.05
        volumeBar.value = this.volume * 100
        this.loadCurVolumeIcon()

        //set config
        randomBtn.classList.toggle('active',this.isRandom)
        repeatBtn.classList.toggle('active',this.isRepeat)
    },
    nextSong: function () {
        this.curIndex++
        if(this.curIndex >= this.songs.length){
            this.curIndex = 0
        }
        this.loadCurSong()
    },
    prevSong: function () {
        this.curIndex--
        if(this.curIndex < 0 ){
            this.curIndex = this.songs.length - 1
        }
        this.loadCurSong()
    },
    playRandom: function(){
        //randomArr contain the indexes of songs not in order 
        //ex [5,2,1,0,3]
        //randomArrCurIndex is the current index of random arr
        if(!this.randomArr || this.randomArr.length === 0){
            this.randomArr = generateRandomArray(this.songs.length,this.curIndex)
        }   
        // console.log(this.randomArrCurIndex)
        this.curIndex = this.randomArr[this.randomArrCurIndex]
        this.loadCurSong()
    },
    // handle album
    handleDeleteAlbum: async function(name){
        const albums = await getAllAlbums()
        const albumToDelete = albums.find(album => album.name === name)
        if (albumToDelete) {
            const albumId = albumToDelete.id;
            deleteAlbum(albumId)
        }else{
            alert('Không thể xóa mọi bài hát')
        }
    },
    handleChosingAlbum: async function(name){
        const albums = await getAllAlbums()
        const albumToChose = albums.find(album => album.name === name)
        this.curAlbumlist = albumToChose.songlist
    },
    start: function(){
        //dinh nghia cac thuoc tinh cho obj
        this.defineProperties()

        //load the state of israndom, isrepeat
        this.loadConfig()

        this.handleEvents()
        
        this.render()

        this.loadCurSong()    
    }
}
app.start()