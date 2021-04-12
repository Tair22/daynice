try {
    if (ringTr) {
        const cncHost = (typeof rasStatHost === 'undefined') ? 'https://stat.cncenter.cz' : rasStatHost;
        const cncTst = (typeof tst === 'undefined') ? new Date().getTime() : tst;
        const url = cncHost + "/tr/" + ringTr + "?tst=" + cncTst;
        const img = new Image();
        img.src = url;
    }
} catch (e) {
}