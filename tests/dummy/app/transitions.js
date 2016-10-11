export default function(){
  this.transition(
    this.fromRoute('index'),
    this.useAndReverse('pixelize')
  );

  this.transition(
    this.fromRoute('pizza'),
    this.toRoute('burrito'),
    this.use('doom-screen'),
    this.reverse('cube', { duration: 1000 })
  );
}
