package ro.ase.cts.animals;

public class Lion extends Animal {
    private int weight;

    public Lion(String name, int age, FoodType foodType, int weight) {
        super(name, age, foodType);
        this.weight = weight;
    }

    @Override
    public void eat(String zooKeeperName) {
        System.out.println("Zookeeper " + zooKeeperName + " feeds lion " + super.name + " with " + super.foodType);
    }
}
