from AI import generate_directing_plan

def main():
    plot = input("Enter your short film plot: ")
    genre = input("Enter the film genre (Drama, Thriller, Horror, etc.): ")
    duration = input("Enter total film duration: ")

    result = generate_directing_plan(plot, duration, genre)
    print("\n" + result + "\n")

if __name__ == "__main__":
    main()
