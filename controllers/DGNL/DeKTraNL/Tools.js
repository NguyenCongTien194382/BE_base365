

exports.RanDoomCh = (numberOfElements = Number,max = Number, arrayOrin = []) => {

    // Tạo một mảng ranh giới từ 1 đến 100 với 10 phần tử
    var array = [];
    var min = 0; // Giới hạn dưới
    // max Giới hạn trên
    // numberOfElements  Số lượng phần tử trong mảng

    for (var i = 0; i < numberOfElements; i++) {
        // Tạo số ngẫu nhiên từ min đến max và thêm vào mảng
        var randomNumber = Math.floor(Math.random() * (max - min + 1)) + min;
        array.push(arrayOrin[randomNumber]);
    }
    
    // In ra mảng ranh giới
    console.log(array);
    return array
}