---
title: "Understanding the Pipeline Design Pattern"
description: "How to break one heavy workflow into staged, parallel processing for better throughput."
date: 2023-05-27T11:30:00+07:00
categories:
  - design
  - parallel processing
tags:
  - pipelines
  - concurrency
  - architecture
---

The pipeline design pattern breaks a large workflow into smaller stages.
Each stage performs one job and passes output to the next stage, similar to an assembly line.

## The Concept

Think of a car assembly line. Building each car is split into repeatable steps (for example, installing the windshield), and each worker specializes in one step.

The same approach applies to software. Instead of completing every operation for one item end-to-end, stages work in parallel across many items. That increases throughput and keeps each stage focused.

## Example

Let's consider a tool that classifies website content. It scrapes text, cleans it, sends the cleaned text to two models (M1 and M2), and combines the predictions into a final category. That gives us five stages:

1. Scraping the website for text.
2. Cleaning the scraped text data.
3. Sending the cleaned text data to the M1 machine learning model.
4. Sending the cleaned text data to the M2 machine learning model.
5. Calculating the final category of the website using predictions from M1 and M2.

Now imagine we need to process 100 domains. Running those five steps sequentially for each domain is slow and inefficient.

Let's see how we can use the pipeline design pattern to be much more efficient.

A better approach is to process domains in batches (for example, 10 at a time) through STAGE1 to STAGE5.

Take the first batch, B1. It starts at STAGE1 (scraping), then moves to STAGE2 (cleaning). While B1 is in STAGE2, batch B2 enters STAGE1. After warm-up, every stage is busy at the same time.

Except for startup and shutdown, each stage usually has one batch in progress. That continuous flow is the key reason pipelines improve efficiency.
