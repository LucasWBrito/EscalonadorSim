"use strict";

class Processo {
    nome;
    TC;
    TS1;
    TS2;
    tempoEspera;
    tempoProcessado = 0;
    noProcessador = false;
    completouTS1 = false;
    tempoFinal;
    tempoEsperaPronto;

    constructor(numero, TC, TS1, tempoEspera, TS2){
        this.nome = 'P' + numero;
        this.TC = TC;
        this.TS1 = TS1;
        this.TS2 = TS2;
        this.tempoEspera = tempoEspera;
    }

    tempoRestante() {
        if(this.completouTS1){
            return this.TS2 - this.tempoProcessado;
        }
        return this.TS1 - this.tempoProcessado;
    }

    TT() {
        return this.tempoFinal - this.TC;
    }

    processa() {
        this.tempoProcessado++;
    }

    TTTS() {
        return this.TT()/(this.TS1+this.TS2);
    }
};

let filaNovos = [];
let filaProntos = [];
let filaEspera = [];
let procTerminados = [];
let procInCPU;

let oTempo = 0;

let nameCounter = 1;

let parar = false;

function verificaNovos() {
    let criado = filaNovos.find(item => item.TC == oTempo);
    let indexCriado = filaNovos.findIndex(item => item.TC == oTempo);
    if(criado){
        if(procInCPU){
            filaProntos.push(procInCPU);
            mostraGanttSaida();
            procInCPU = undefined;
        }
        filaNovos.splice(indexCriado, 1);
        filaProntos.push(criado);
        parar = true;
        return true;
    }
    return false;    
}

function verificaEspera() {
    let espera = filaEspera.find(item => item.tempoEsperaPronto == oTempo);
    let indexEspera = filaEspera.findIndex(item => item.tempoEsperaPronto == oTempo);
    if(espera){
        if(procInCPU){
            if(!procInCPU.tempoRestante()==0){
                filaProntos.push(procInCPU);
                mostraGanttSaida();
                procInCPU = undefined;
            }
            
        }
        filaEspera.splice(indexEspera, 1);
        filaProntos.push(espera);
        parar = true;
        return true;
    }
    return false;    
}

function verificaProntos() {
    if(!filaProntos.length){
        return false;
    }
    
    procInCPU = filaProntos.find(item => item.noProcessador == true);
    let indexInCPU = filaProntos.findIndex(item => item.noProcessador == true);

    if(!procInCPU){

        procInCPU = filaProntos.reduce(function(ante, atual) {
            return ante.tempoRestante() <= atual.tempoRestante() ? ante : atual;
        });

        indexInCPU = filaProntos.findIndex(item => item.nome == procInCPU.nome);
        filaProntos.splice(indexInCPU, 1);

        //procInCPU.noProcessador = true;
        mostraGanttEntrada();
        parar = true;
        return true;
    }
        filaProntos.splice(indexInCPU, 1);
        //procInCPU.noProcessador = true;
        mostraGanttEntrada();
        parar = true;
        return true;
}

function verificaCPU() {
    if(!procInCPU){
        return verificaProntos();
    }
    if(!procInCPU.completouTS1){
        if(procInCPU.tempoProcessado == procInCPU.TS1){
            procInCPU.noProcessador = false;
            procInCPU.tempoProcessado = 0;
            procInCPU.tempoEsperaPronto = procInCPU.tempoEspera + oTempo;
            procInCPU.completouTS1 = true;
            filaEspera.push(procInCPU);
            mostraGanttSaida();
            procInCPU = undefined;
            parar = true;
            return true;
        }
        return false;
    }
    if(procInCPU.tempoProcessado == procInCPU.TS2){
        procInCPU.noProcessador = false;
        procInCPU.tempoFinal = oTempo;
        procTerminados.push(procInCPU);
        mostraGanttSaida();
        procInCPU = undefined;
        parar = true;
        return true;
    }
    return false;
}

function mostraFilaNovos() {

    let listaNovos = document.getElementById("listaNovos");

    listaNovos.innerHTML = '';

    for(let i = 0; i < filaNovos.length; i++) {
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        let texto = document.createTextNode(filaNovos[i].nome);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaNovos.appendChild(tr);

        td = document.createElement('td');
        texto = document.createTextNode(filaNovos[i].TC);  
        tr.appendChild(td);
        td.appendChild(texto);
        listaNovos.appendChild(tr)
        
        td = document.createElement('td');
        texto = document.createTextNode(filaNovos[i].TS1);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaNovos.appendChild(tr);
        
        td = document.createElement('td');
        texto = document.createTextNode(filaNovos[i].tempoEspera);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaNovos.appendChild(tr);

        td = document.createElement('td');
        texto = document.createTextNode(filaNovos[i].TS2);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaNovos.appendChild(tr);
    }
}
function mostraFilaProntos() {
    
    let listaProntos = document.getElementById("listaProntos");

    listaProntos.innerHTML = '';

    for(let i = 0; i < filaProntos.length; i++) {
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        let texto = document.createTextNode(filaProntos[i].nome);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaProntos.appendChild(tr);
        
        td = document.createElement('td');
        texto = document.createTextNode(filaProntos[i].tempoRestante());  
        td.appendChild(texto);
        tr.appendChild(td);
        listaProntos.appendChild(tr);    
    }
}

function mostraFilaEspera() {
    
    let listaEspera = document.getElementById("listaEspera");

    listaEspera.innerHTML = '';

    for(let i = 0; i < filaEspera.length; i++) {
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        let texto = document.createTextNode(filaEspera[i].nome);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaEspera.appendChild(tr);
        
        td = document.createElement('td');
        texto = document.createTextNode(filaEspera[i].tempoEsperaPronto);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaEspera.appendChild(tr);    
    }
}

function mostraProcTerminados() {
    
    let listaTerminados = document.getElementById("listaTerminados");

    listaTerminados.innerHTML = '';

    for(let i = 0; i < procTerminados.length; i++) {
        let tr = document.createElement('tr');

        let td = document.createElement('td');
        let texto = document.createTextNode(procTerminados[i].nome);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaTerminados.appendChild(tr);
        
        td = document.createElement('td');
        texto = document.createTextNode(procTerminados[i].tempoFinal);  
        td.appendChild(texto);
        tr.appendChild(td);
        listaTerminados.appendChild(tr);    
    }
}

function mostraoTempo() {
    let tempo = document.getElementById("oTempo");
    tempo.innerHTML = '';
    
    let textoTempo = document.createTextNode("Tempo: " + oTempo);

    tempo.appendChild(textoTempo);
}

function mostraCPU() {
    let cpu = document.getElementById("CPU");
    cpu.innerHTML = '';
    let textocpu;
    if(procInCPU){
        textocpu = document.createTextNode("CPU: " + procInCPU.nome + ' ' + procInCPU.tempoRestante());
    } else {
        textocpu = document.createTextNode("CPU: " + "Vazio");
    }

    cpu.appendChild(textocpu);
}

function mostraGanttEntrada() {
    let ganttHead = document.getElementById("ganttHead");
    let th = document.createElement("th");
    th.setAttribute("colspan", "2");
    let textoNome = document.createTextNode(procInCPU.nome);

    th.appendChild(textoNome);
    ganttHead.appendChild(th);

    let ganntBody = document.getElementById("ganttBody");
    let td = document.createElement("td");
    let textoTempo = document.createTextNode(oTempo);

    td.appendChild(textoTempo);
    ganntBody.appendChild(td);
}

function mostraGanttSaida() {
    let ganntBody = document.getElementById("ganttBody");
    let td = document.createElement("td");
    let textoTempo = document.createTextNode(oTempo);

    td.appendChild(textoTempo);
    ganntBody.appendChild(td);
}

function tabelaDesempenho() {
    let tabelaDesempenho = document.getElementById("tabelaDesempenho");
    let tablehead = document.createElement('thead');
    let tablebody = document.createElement('tbody');
    let texto = document.createTextNode('');  

    //head
    let tr = document.createElement('tr');
    for(let i = -1; i < procTerminados.length+1; i++){
        let th = document.createElement('th');
        
        if(i == -1){
            texto = document.createTextNode('');
        } else if(i == procTerminados.length){
            texto = document.createTextNode('Média');
        } else {
            texto = document.createTextNode(procTerminados[i].nome);
        }
        
        th.appendChild(texto);
        tr.appendChild(th);
    }
    tablehead.appendChild(tr);
    tabelaDesempenho.appendChild(tablehead);
    
    // body TC
    tr = document.createElement('tr');
    for(let i = -1; i < procTerminados.length+1; i++){
        let td = document.createElement('td');
        
        if(i == -1){
            texto = document.createTextNode('TC');
        } else if(i == procTerminados.length){
            texto = document.createTextNode('');
        } else {
            texto = document.createTextNode(procTerminados[i].TC);
        }
        
        td.appendChild(texto);
        tr.appendChild(td);
    }
    tablebody.appendChild(tr);
    tabelaDesempenho.appendChild(tablebody);
    // body TS
    tr = document.createElement('tr');
    for(let i = -1; i < procTerminados.length+1; i++){
        let td = document.createElement('td');
        
        if(i == -1){
            texto = document.createTextNode('TS');
        } else if(i == procTerminados.length){
            texto = document.createTextNode('');
        } else {
            texto = document.createTextNode(procTerminados[i].TS1+procTerminados[i].TS2);
        }
        
        td.appendChild(texto);
        tr.appendChild(td);
    }
    tablebody.appendChild(tr);
    tabelaDesempenho.appendChild(tablebody);
    // body TT
    tr = document.createElement('tr');
    let somaTT = 0;
    for(let i = -1; i < procTerminados.length+1; i++){
        let td = document.createElement('td');
        
        if(i == -1){
            texto = document.createTextNode('TT');
        } else if(i == procTerminados.length){
            texto = document.createTextNode((somaTT/procTerminados.length).toFixed(2));
        } else {
            somaTT += procTerminados[i].TT();
            texto = document.createTextNode(procTerminados[i].TT());
        }
        
        td.appendChild(texto);
        tr.appendChild(td);
    }
    tablebody.appendChild(tr);
    tabelaDesempenho.appendChild(tablebody);
    //TT/TS
    tr = document.createElement('tr');
    let somaTTTS = 0;
    for(let i = -1; i < procTerminados.length+1; i++){
        let td = document.createElement('td');
        
        if(i == -1){
            texto = document.createTextNode('TT/TS');
        } else if(i == procTerminados.length){
            texto = document.createTextNode((somaTTTS/procTerminados.length).toFixed(2));
        } else {
            somaTTTS += procTerminados[i].TTTS()
            texto = document.createTextNode((procTerminados[i].TTTS()).toFixed(2));
        }
        
        td.appendChild(texto);
        tr.appendChild(td);
    }
    tablebody.appendChild(tr);
    tabelaDesempenho.appendChild(tablebody);

}

document.getElementById("addButton").onclick = function() {

    //let novoNome = document.getElementById("novoNome").value;
    let novoTC = +document.getElementById("novoTC").value;
    let novoTS1 = +document.getElementById("novoTS1").value;
    let novoIO = +document.getElementById("novoIO").value;
    let novoTS2 = +document.getElementById("novoTS2").value;

    let novoProc = new Processo(nameCounter, novoTC, novoTS1, novoIO, novoTS2);

    nameCounter++;

    filaNovos.push(novoProc);

    mostraFilaNovos();

}

document.getElementById("proxPasso").onclick = function() {
   
    parar = false;
    
    while(parar==false){
        if(!verificaEspera()){
            if(!verificaCPU()){
                if(!verificaNovos()){
                    oTempo++;
                    procInCPU.processa();
                }
            }
        }
    
        //mostraFilaNovos();
        mostraFilaProntos();
        mostraFilaEspera();
        mostraProcTerminados();
        mostraCPU();
    
        mostraoTempo();
    
        if(!filaNovos.length && !filaProntos.length && !filaEspera.length && !procInCPU){
            tabelaDesempenho();
        }
    }
    

}