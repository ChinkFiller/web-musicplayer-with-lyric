function keyevent(event){
        event = event || window.event;
        if (event.keyCode == 13) {
            const e = document.getElementById('search').value;
            if (e==''){return}
            window.location.href = `/login/search_music?wd=${e}`
   }
        }
function btnevent(){
    const e = document.getElementById('search').value;
    if (e==''){return}
    window.location.href = `/login/search_music?wd=${e}`
}