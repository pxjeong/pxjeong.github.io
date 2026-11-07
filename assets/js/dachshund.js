const dog = document.querySelector('.dachshund');

if (dog) {
  let happyTimer;
  dog.addEventListener('click', () => {
    clearTimeout(happyTimer);
    dog.classList.add('is-happy');
    happyTimer = setTimeout(() => dog.classList.remove('is-happy'), 1600);
  });
}
