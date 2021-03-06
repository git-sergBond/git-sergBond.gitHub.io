export default class TradePoint{


    //
    //приравнять активную точку к видимой
    //

    //класс характеризующий точку оказания услуги
    constructor(point, services, mapIsnt, VueContext, drawOnmap = true, properties = null, events = null, draggable = true) {
        try {
            //данные принимаемые с сервера
            this.pointid = !!point.pointid ? point.pointid : null
            this.latitude = point.latitude;//широта
            this.longitude = point.longitude;//долгота
            this.name = point.name // название точки оказания услуг
            this.address = point.address;//адрес
            this.phones = point.phones;//имеющиеся номера телефонов у точки
            this.newPhones = []; //массив для новых номеров телефонов
            this.categories = []; //массив категорий, к которым нужно привязать услугу
            //для обратной связи
            this.services = services;
            //хинт, балун

            //преднастройка иконок
            //полезные данные при клике

            // данные вообще 
            this.properties = properties;//и перредаются в DrawMap

            //гуи
            this.VueContext = VueContext;//контекст экземпляра Vue
            this.mapIsnt = mapIsnt;//контекст яндекс карты
            if (drawOnmap) {
               /* this.pointInst = */this.DrawOnMap(properties, events, draggable);//контекст точки на яндекс карте
                this.setActive(true); // индикатор показывающий, передавать точку на карту или нет 
            }
            this.selected = false //нужен для показа номеров и прочей херни по точке
        } catch (e) {
            console.log('class TradePoint.constructor() : ' + e.message)
        }
    }


    //
    //  добавить методы 
    //

    //добавление телефона к услуге
    addNewPhone(){
        this.newPhones.push({
            "active": true,//показывает активен ли телефон
            "phone": ""//непосредственно номер телефона
        })
    }
    //измененить название на иконке, которое будет соответствовать точке
    changeCaption(){
        try{
            this.pointInst.properties.set({
                iconCaption: this.name
            });
        }catch(e){
            console.log('class TradePoint.changeCaption() : '+e.message)
        }
    }
    //установить координаты
    setCoords(coords){
        let context = this;
        try{
            this.latitude = coords[0];//широта
            this.longitude = coords[1];//долгота
            this.pointInst.geometry.setCoordinates(coords);//меняем координаты метки
            //вычисляем адрес метки, относительно координат
            let res = ymaps.geocode([this.latitude,this.longitude]);
            res.then(res=>{
                let firstGeoObject = res.geoObjects.get(0);
                let address = firstGeoObject.getAddressLine();
                context.address = address;
            });
        }catch(e){
            console.log('class TradePoint.setCoords() : '+e.message)
        }
    }
    //установить координаты, по адресу метки
    setCoordsForAdress(){
        let context = this
        try{
            let res = ymaps.geocode(this.address);
            res.then(res=>{
                let coord = res.geoObjects.get(0).geometry.getCoordinates()
                context.setCoords(coord)
            });
        }catch(e){
            console.log('class TradePoint.setCoordsForAdress() : '+e.message)
        }
    }
    //метод отрисовки метки на карте
    DrawOnMap(properties={},events=[],draggable=false){
        let context = this
        let p = new ymaps.Placemark([this.latitude,this.longitude], 
        {
            iconCaption: context.name
        }, 
        {
            preset: 'islands#darkblueDotIconWithCaption',
            draggable: draggable
        });
        this.pointInst = p;
        try{

            p.properties.set({
                linkOnStruct: context,//сылка на структуру, для обратной связи
            });
            if(!!properties) p.properties.set({
                ...properties //сохраняем важные данные
            });
        
            this.addEvents(events);
        
            this.mapIsnt.geoObjects.add(p);
        }catch(e){
            console.log('class TradePoint.DrawOnMap() : '+e.message)
        }
        return p;
    }
    //добавление событий
    addEvents(events){
        //click, драг(dragend), двойной клик, наведение
        if(!!events) for(let {name,event} of events) {
            this.pointInst.events.add(name, event);
        }
    }
    //установка видимости метки
    SetVisibleOnMap(vis){
        try{
            this.pointInst.options.set({ "visible": vis});
        }catch(e){
            console.log('class TradePoint.SetVisibleOnMap() : '+e.message)
        }
    }
    //Активный или нет? (формирует список того, что нужно передать на сервер)
    setActive(val){
        try{
            this.SetVisibleOnMap(val);
            this.active = val
        }catch(e){
            console.log('class TradePoint.setActive() : '+e.message)
        }
    }
    //посчитали индекс квадранта для заданного масштабы
    calculate_index_for_square(coord, scale=500000){
        try{
        let tableScale = [];
        // таблица масштабов
        // [масштаб] = [размер широты, оазмер долготы]
        tableScale[500000] = [2, 3];
        let degs = tableScale[scale];//вытащили размеры ячейки из таблицы
        let index = (coord[0] / degs[0]) * (coord[1] / degs[1] + 1);
        return index;
        }catch(e){
            console.log('class TradePoint.calculate_index_for_square() : '+e.message)
        }
    }
}