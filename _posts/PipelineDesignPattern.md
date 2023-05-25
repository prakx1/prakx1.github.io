
# Understanding the Pipeline Design Pattern

The Pipeline Design Pattern is a way to solve problems by breaking them down into smaller tasks that are completed in a sequence, similar to an assembly line in a factory. It's like dividing a big task into several smaller steps and passing the output of one step as the input to the next step until the final result is achieved.

## The Concept

Think of an assembly line where the goal is to manufacture a number of cars. The manufacture of each car can be separated into a sequence of smaller operations (e.g., installing a windshield), with each operation assigned to a different worker. As the car-to-be moves down the assembly line, it is built up by performing the sequence of operations; each worker, however, performs the same operation over and over on a succession of cars​


The Pipeline Design Pattern involves breaking down a series of computations into distinct stages. Each stage performs a part of the computation, then passes it to the next stage while starting on the next computation. This allows multiple stages to be processed at the same time, improving efficiency.


## Example 
Let's consider a tool that is built to classify the text content of websites. It scrapes the websites for text data, then sends this text data to a service for cleaning. Following that, the cleaned data is sent to two machine learning models, M1 and M2, for predictions. These models return categories along with scores. Lastly, the final category of the website is calculated using the predictions from M1 and M2. Therefore, there are five operations to be performed:

1. Scraping the website for text.
2. Cleaning the scraped text data.
3. Sending the cleaned text data to the M1 machine learning model.
4. Sending the cleaned text data to the M2 machine learning model.
5. Calculating the final category of the website using predictions from M1 and M2.

Consider a situation where we need to scrape data from 100 different domains. If we perform all the operations sequentially for each domain, it would be highly inefficient.

 Let's see how we can use the pipeline design pattern to be much more efficient . 
 
 Consider a scenario where we need to process a large number of domains. Instead of processing them all at once, we divide them into smaller batches of 10 domains each. These batches are then processed in stages, going through five different operations: STAGE1 to STAGE5. 

Let's take the first batch, B1, as an example. B1 starts at STAGE1, where it undergoes scrapping. Once B1 completes STAGE1, it moves on to STAGE2 for cleaning while the next batch, B2, enters STAGE1 for scrapping. This creates a pipeline where, after the initial setup, each stage is continuously processing a batch. 

Except for the first and last batches, there will always be one batch at each stage of the pipeline at any given time. This ensures a continuous flow of processing, making our system more efficient."

