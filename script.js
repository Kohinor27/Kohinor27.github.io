// ===== Intro Page =====
document.addEventListener('DOMContentLoaded', () => {}
const intro = document.getElementById('intro');
const quizPage = document.getElementById('quizPage');
const startBtn = document.getElementBtId('startQuiz');

if (startBtn && intro && quizPage) {
    startBtn.addEventListener('click', () => {
        intro.classList.add('hidden');
        quizPage.classList.remove('hidden');
    });
} else {
    console.warn("Could not find startQuiz, intro, or quizPage in the DOM");
}
});

// ===== Quiz Settings =====
const SHUFFLE_QUESTIONS = true;
const CHOICES_PER_QUESTION = 4;

// ===== Data =====
const COUNTRIES = [
    { country: "United Kingdom", capital: "London" },
    { country: "France", capital: "Paris" },
    { country: "Germany", capital: "Berlin" },
    { country: "Italy", capital: "Rome" },
    { country: "Spain", capital: "Madrid" },
    { country: "Portugal", capital: "Lisbon" },
    { country: "Netherlands", capital: "Amsterdam" },
    { country: "United States", capital: "Wasington DC" },
    { country: "Canada", capital: "Ottawa" },
    { country: "Mexico", capital: "Mexico City" },
    { country: "Brazil", capital: "Brasília" },
    { country: "Argentina", capital: "Buenos Aires" },
    { country: "China", capital: "Beijing" },
    { country: "Japan", capital: "Tokyo" },
    { country: "India", capital: "New Delhi" },
    { country: "Russia", capital: "Moscow" },
    { country: "Australia", capital: "Canberra" },
];

// ===== Helpers =====
const $ = (sel) => document.querySelector(sel) => document.querySelector(sel);
function shuffle(arr) { const a=arr.slice();  for(let i=a.length-1;i>0;i--){const j=Math.floor(Math.random()*(i+1));[a[i],a[j]]=[a[j],a[i]]}return a; }
function sample(arr,n){return shuffle(arr).slice(0,n);}
function buildQuestionPool(length){
    const base = SHUFFLE_QUESTIONS ? shuffle(COUNTRIES) : COUNTRIES.slice();
    const pool = (length==='all')? base: base.slice(0,Math.min(length,base.length));
    return pool.map(item)=>{
        const other = COUNTRIES.filter(x=>x.capital!==item.capital).map(x=>x.capital);
        const distractors = sample(other, CHOICES_PER_QUESTION - 1);
        const choices = shuffle([item.capital, ...distractors]);
        return {promp: 'What is the capital of ${item.country}?', choices, correctIndex: choices.indexOf(item.capital), answer: item.capital};
    });

}

// ===== State =====
let questions=[], index=0, answrs=[];

// =====UI Wiring =====
const startBtn = $("#start"), resetBtn=$("#reset"), lengthSel=$("#Length");
const progressE1=$("#progress"), questionE1=$("#question"), answersForm=$("#answers");
constPrevBtn=$("#prev"), nextBtn=$("#next"), submitBtn=$("#submit");
const resultPage=$("#resultPage"), scoreE1=$("#score"), reviewE1=$("#review");
const retryBtn=$("#retry"), backIntroBtn=document.getElementById("backIntro");

startBtn.addEventListener("click", () => {
    const len=lengthSel.value; questions=buildQuestionPool(len);
    index=0; answers=Array(questions.length).fill(null);
    startBtn.disabled=true; resetBtn.disabled=false; submitBtn.disabled=false;
    resultsCard.classList.add("hidden"); updateUI();
});
resetBtn.addEventListener("click", () => {
    startBtn.disabled=false; resetBtn.disabled=true; submitBtn.disabled=true;
    questionsE1.textContent=""; answersForm.innerHTML=""; 
    progressE1.textContent="Ready when you are."; resultsCard.classList.add("hidden");
});

PrevBtn.addEventListener("click", () => { if(index>0){index--; updateUI(); } });
nextBtn.addEventListener("click", () => { if(index<questions.length-1){index++; updateUI(); } });

submitBtn.addEventListener("click", () => {
    let correct=0; answers.forEach((a,i) => { if(a===questions[i].correctIndex) correct++; });
    const pct=Math.round((correct/questions.length)*100);
    scoreLine.textContent=`You scored ${correct} out of ${questions.length} (${pct}%)`;
    reviewList.innerHTML="";
    questions.forEach((q,i) => {
        const row=document.createElement("div");
        row.className="row "+(answers[i]===q.correctIndex?"correct":"incorrect");
        const userAnswer=answers[i]!==null ? q.choices[answers[i]] : "No answer";
        row.innerHTML=`<strong>Q${i+1}:</strong> ${q.prompt}<br/>
        <em>Your answer:</em> ${userAnswer}<br/><em>Correct answer:</em> ${q.answer}`;
        reviewList.appendChild(row);
    });

    resultsCard.classList.remove("hidden");
    window.scrollTo({top:document.body.scrollHeight, behavior:"smooth"});
});

retryBtn.addEventListener("click", () => {
    startBtn.disabled=false; resetBtn.disabled=true; submitBtn.disabled=true;
    resultsCard.classList.add("hidden"); questionE1.textContent="Ready when you are.";
});

backIntroBtn.addEventListener("click", () => {
    resultsCard.classList.add("hidden"); quizPage.classList.add("hidden");
    intro.classList.remove("hidden");
    startBtn.disabled=false; resetBtn.disabled=true; submitBtn.disabled=true;
    questionE1.textContent=""; answersForm.innerHTML=""; 
    progressE1.textContent="Ready when you are.";
});

function updateUI(){
    const q=questions[index];
    progressE1.textContent=`Question ${index+1} of ${questions.length}`;
    questionE1.textContent=q.prompt; answersForm.innerHTML="";
    q.choices.forEach((choice,i) => {
        const id=`q${index}_choice${i}`; label=document.createElement("label");
        label.className="answers"; label.setAttribute("for",id);
        const inpudocument.createElement("input");
        input.type="radio"; input.name="answer"; input.id=id; input.value=i;
        input.checked=answers[index]===i; input.addEventListener("change", () => {answers[index]=i; });
        const span=document.createElement("span"); span.textContent=choice;
        label.appendChild(input); label.appendChild(span);
        answersForm.appendChild(label);
    });

    prevBtn.disabled=index===0; nextBtn.disabled=index===questions.length-1;
}
