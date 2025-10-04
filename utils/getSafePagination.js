const getSafePagination = (items_per_page, current_page) => {
    
    // a) itemsPerPage (페이지당 항목 수) 처리
    let itemsPerPage = items_per_page;
    
    // 숫자가 아니거나, 정의되지 않았거나, 10보다 작으면 10으로 설정
    if (typeof itemsPerPage !== 'number' || !itemsPerPage || itemsPerPage < 10) {
        itemsPerPage = 10;
    }

    // b) currentPage (현재 페이지) 처리
    let currentPage = current_page;
    
    // 숫자가 아니거나, 정의되지 않았거나, 1보다 작으면 1로 설정
    if (typeof currentPage !== 'number' || !currentPage || currentPage < 1) {
        currentPage = 1;
    }

    // c) Offset 계산
    const offset = (currentPage - 1) * itemsPerPage;

    return {
        itemsPerPage,
        currentPage,
        offset
    };
};


module.exports = getSafePagination;