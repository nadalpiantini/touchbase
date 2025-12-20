#!/usr/bin/env npx ts-node
/**
 * TouchBase Academy - Complete Production-Like Seed Data
 *
 * Generates:
 * - 5 Organizations
 * - 100+ Users (5 admin, 15 teachers, 80+ students)
 * - 25 Classes
 * - 50+ Modules with real life skills content
 * - 500+ Module Steps (content, quiz, scenario)
 * - 150+ Assignments
 * - 300+ Progress records
 * - 25 Badges
 * - 500+ Attendance records
 * - 50 Schedules
 */

import { createClient } from '@supabase/supabase-js';
import { config } from 'dotenv';
import { join } from 'path';

config({ path: join(__dirname, '..', '.env.local') });

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceRole = process.env.SUPABASE_SERVICE_ROLE!;

const supabase = createClient(supabaseUrl, supabaseServiceRole, {
  auth: { autoRefreshToken: false, persistSession: false }
});

// ============================================================
// HELPER FUNCTIONS
// ============================================================

function generateUUID(): string {
  return crypto.randomUUID();
}

function randomElement<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function generateClassCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  return Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
}

function randomDate(start: Date, end: Date): Date {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================
// REAL LIFE SKILLS CONTENT
// ============================================================

const LIFE_SKILLS_MODULES = {
  communication: [
    {
      title: 'Active Listening',
      description: 'Master the art of truly hearing and understanding others through focused attention and empathetic responses.',
      difficulty: 'beginner',
      duration: 30,
      skills: ['listening', 'empathy', 'focus'],
      steps: [
        {
          type: 'content',
          title: 'What is Active Listening?',
          content: `# Active Listening: The Foundation of Great Communication

Active listening is more than just hearing words—it's about fully concentrating on what someone is saying, understanding their message, and responding thoughtfully.

## Key Components:
1. **Pay Attention** - Give the speaker your undivided attention
2. **Show You're Listening** - Use body language and gestures to show engagement
3. **Provide Feedback** - Reflect on what has been said by paraphrasing
4. **Defer Judgment** - Allow the speaker to finish before forming opinions
5. **Respond Appropriately** - Be honest and respectful in your response

## Why It Matters:
- Builds stronger relationships
- Prevents misunderstandings
- Shows respect for others
- Improves problem-solving abilities`
        },
        {
          type: 'quiz',
          title: 'Check Your Understanding',
          questions: [
            {
              question: 'What is the first step in active listening?',
              options: ['Forming your response', 'Paying full attention', 'Taking notes', 'Nodding frequently'],
              correct: 1,
              explanation: 'Paying full attention to the speaker is the foundation of active listening.'
            },
            {
              question: 'Which of these is NOT a component of active listening?',
              options: ['Providing feedback', 'Deferring judgment', 'Multitasking while listening', 'Showing you\'re listening'],
              correct: 2,
              explanation: 'Multitasking interferes with the ability to truly listen and understand.'
            },
            {
              question: 'How can you show someone you\'re actively listening?',
              options: ['Looking at your phone', 'Making eye contact and nodding', 'Interrupting with your opinion', 'Finishing their sentences'],
              correct: 1,
              explanation: 'Body language like eye contact and nodding demonstrates engagement.'
            }
          ]
        },
        {
          type: 'scenario',
          title: 'Practice Active Listening',
          scenario: `Your friend comes to you upset about a problem at work. They start explaining the situation but you're also thinking about your own stressful day.`,
          choices: [
            {
              text: 'Let them finish while checking your phone occasionally',
              feedback: 'This shows you\'re not fully present. Try putting away distractions.',
              isOptimal: false
            },
            {
              text: 'Put away distractions, make eye contact, and say "Tell me more about what happened"',
              feedback: 'Excellent! You\'re showing full attention and encouraging them to share.',
              isOptimal: true
            },
            {
              text: 'Interrupt to share your own similar experience',
              feedback: 'While relating is good, interrupting shifts focus away from their problem.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Public Speaking Fundamentals',
      description: 'Build confidence and skills to speak effectively in front of groups of any size.',
      difficulty: 'intermediate',
      duration: 45,
      skills: ['presentation', 'confidence', 'communication'],
      steps: [
        {
          type: 'content',
          title: 'Overcoming Fear of Public Speaking',
          content: `# Conquering Stage Fright

Public speaking is one of the most common fears, but it's also one of the most valuable skills you can develop.

## Understanding the Fear
- Fear of judgment
- Fear of forgetting what to say
- Fear of physical symptoms (shaking, sweating)

## Strategies to Overcome:
1. **Prepare Thoroughly** - Know your material inside and out
2. **Practice Out Loud** - Rehearse in front of a mirror or record yourself
3. **Visualize Success** - Imagine yourself delivering a great presentation
4. **Start Small** - Begin with smaller audiences and build up
5. **Focus on the Message** - Shift focus from yourself to your content

## Quick Calming Techniques:
- Deep breathing (4-7-8 technique)
- Power poses before speaking
- Arrive early to get comfortable with the space`
        },
        {
          type: 'content',
          title: 'Structuring Your Speech',
          content: `# The Art of Speech Structure

Every great speech follows a clear structure that guides the audience.

## The Classic Structure:
1. **Opening Hook** (10%) - Grab attention with a story, question, or surprising fact
2. **Introduction** (10%) - Preview what you'll cover
3. **Body** (70%) - Your main points (limit to 3 for best retention)
4. **Conclusion** (10%) - Summarize and call to action

## Tips for Each Section:

### Opening:
- "What if I told you..."
- Share a relevant personal story
- Ask a thought-provoking question

### Body:
- Use the "Rule of Three"
- Support each point with evidence
- Use transitions between points

### Conclusion:
- Circle back to your opening
- End with a memorable statement
- Give a clear call to action`
        },
        {
          type: 'quiz',
          title: 'Test Your Knowledge',
          questions: [
            {
              question: 'What percentage of your speech should the body typically represent?',
              options: ['50%', '60%', '70%', '80%'],
              correct: 2,
              explanation: 'The body of your speech should be about 70% of your total content.'
            },
            {
              question: 'What is the recommended maximum number of main points for best audience retention?',
              options: ['2', '3', '5', '7'],
              correct: 1,
              explanation: 'The Rule of Three suggests limiting main points to 3 for optimal retention.'
            }
          ]
        }
      ]
    },
    {
      title: 'Conflict Resolution',
      description: 'Learn strategies to navigate disagreements constructively and maintain healthy relationships.',
      difficulty: 'intermediate',
      duration: 40,
      skills: ['negotiation', 'empathy', 'problem-solving'],
      steps: [
        {
          type: 'content',
          title: 'Understanding Conflict',
          content: `# The Nature of Conflict

Conflict is a natural part of human interaction. The goal isn't to avoid conflict, but to handle it constructively.

## Types of Conflict:
- **Task Conflict** - Disagreements about goals or methods
- **Relationship Conflict** - Personal friction between individuals
- **Process Conflict** - Disputes about how to do things

## Conflict Styles:
1. **Competing** - Win at all costs
2. **Accommodating** - Give in to keep peace
3. **Avoiding** - Ignore the conflict
4. **Compromising** - Meet in the middle
5. **Collaborating** - Work together for win-win

## The Collaboration Approach:
- Focus on interests, not positions
- Separate people from problems
- Generate options before deciding
- Use objective criteria`
        },
        {
          type: 'scenario',
          title: 'Workplace Disagreement',
          scenario: `You and a coworker disagree about how to approach a project. They want to use method A, but you believe method B would be more effective. The tension is affecting your teamwork.`,
          choices: [
            {
              text: 'Insist on your method since you\'re confident it\'s better',
              feedback: 'This competing approach may damage the relationship and miss potential insights from combining ideas.',
              isOptimal: false
            },
            {
              text: 'Give in and use their method to avoid conflict',
              feedback: 'While this keeps peace, you might miss the chance to improve the project with your insights.',
              isOptimal: false
            },
            {
              text: 'Suggest discussing the pros and cons of each method to find the best approach',
              feedback: 'Excellent! This collaborative approach helps find the best solution while respecting both perspectives.',
              isOptimal: true
            }
          ]
        },
        {
          type: 'quiz',
          title: 'Conflict Resolution Quiz',
          questions: [
            {
              question: 'Which conflict resolution style typically leads to the best long-term outcomes?',
              options: ['Competing', 'Avoiding', 'Collaborating', 'Accommodating'],
              correct: 2,
              explanation: 'Collaborating creates win-win solutions and builds stronger relationships.'
            }
          ]
        }
      ]
    },
    {
      title: 'Non-verbal Communication',
      description: 'Understand and use body language effectively to enhance your communication.',
      difficulty: 'beginner',
      duration: 25,
      skills: ['body-language', 'awareness', 'presentation'],
      steps: [
        {
          type: 'content',
          title: 'The Power of Body Language',
          content: `# Reading and Using Non-verbal Cues

Studies suggest that up to 93% of communication is non-verbal. Understanding body language is crucial for effective communication.

## Key Non-verbal Elements:
- **Facial Expressions** - Universal across cultures
- **Eye Contact** - Shows confidence and interest
- **Posture** - Open vs. closed body positions
- **Gestures** - Hand movements that emphasize points
- **Proxemics** - Use of physical space
- **Touch** - Appropriate physical contact
- **Paralanguage** - Tone, pitch, and pace of voice

## Positive Body Language:
- Maintain appropriate eye contact
- Stand/sit with open posture
- Lean slightly forward when listening
- Use natural hand gestures
- Smile genuinely when appropriate`
        },
        {
          type: 'quiz',
          title: 'Body Language Quiz',
          questions: [
            {
              question: 'What percentage of communication is estimated to be non-verbal?',
              options: ['50%', '70%', '93%', '25%'],
              correct: 2,
              explanation: 'Research suggests up to 93% of communication is conveyed non-verbally.'
            },
            {
              question: 'What does crossed arms typically signal?',
              options: ['Confidence', 'Openness', 'Defensiveness or discomfort', 'Agreement'],
              correct: 2,
              explanation: 'Crossed arms often indicate a closed-off or defensive stance.'
            }
          ]
        }
      ]
    },
    {
      title: 'Assertive Communication',
      description: 'Express your needs and opinions confidently while respecting others.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['assertiveness', 'boundaries', 'self-advocacy'],
      steps: [
        {
          type: 'content',
          title: 'What is Assertiveness?',
          content: `# The Assertive Communication Style

Assertiveness is the healthy middle ground between passive and aggressive communication.

## Communication Styles Spectrum:
- **Passive**: Fails to express needs, avoids conflict
- **Aggressive**: Expresses needs at others' expense
- **Passive-Aggressive**: Indirect expression of hostility
- **Assertive**: Direct, honest, respectful expression

## Assertive Rights:
1. The right to express your feelings
2. The right to say "no" without guilt
3. The right to have your needs considered
4. The right to make mistakes
5. The right to change your mind

## The "I" Statement Formula:
"I feel [emotion] when [situation] because [reason]. I would like [request]."

Example: "I feel frustrated when meetings run late because I have other commitments. I would like us to stick to the scheduled time."`
        },
        {
          type: 'scenario',
          title: 'Setting Boundaries',
          scenario: `Your manager asks you to take on another project, but you're already at capacity. You're worried about saying no.`,
          choices: [
            {
              text: 'Accept the project even though you\'re overwhelmed',
              feedback: 'This passive response may lead to burnout and poor quality work.',
              isOptimal: false
            },
            {
              text: 'Say "I can\'t take on more work. You\'re asking too much!"',
              feedback: 'This aggressive response could damage your professional relationship.',
              isOptimal: false
            },
            {
              text: 'Say "I\'d like to help, but I\'m currently at capacity. Can we discuss prioritization or timeline?"',
              feedback: 'Great assertive response! You express your situation while offering to problem-solve together.',
              isOptimal: true
            }
          ]
        }
      ]
    }
  ],
  financial: [
    {
      title: 'Budgeting Basics',
      description: 'Create and maintain a personal budget that works for your lifestyle.',
      difficulty: 'beginner',
      duration: 35,
      skills: ['budgeting', 'planning', 'discipline'],
      steps: [
        {
          type: 'content',
          title: 'Why Budget?',
          content: `# The Foundation of Financial Health

A budget is simply a plan for your money. It puts you in control of your finances rather than wondering where your money went.

## Benefits of Budgeting:
- Know exactly where your money goes
- Reach financial goals faster
- Reduce financial stress
- Build an emergency fund
- Avoid debt or pay it off faster

## The 50/30/20 Rule:
- **50% Needs**: Rent, utilities, groceries, minimum debt payments
- **30% Wants**: Entertainment, dining out, hobbies
- **20% Savings**: Emergency fund, retirement, debt payoff

## Getting Started:
1. Track all income sources
2. List all expenses for one month
3. Categorize expenses (needs vs wants)
4. Create spending limits for each category
5. Review and adjust monthly`
        },
        {
          type: 'quiz',
          title: 'Budgeting Quiz',
          questions: [
            {
              question: 'In the 50/30/20 rule, what percentage should go to savings?',
              options: ['10%', '20%', '30%', '50%'],
              correct: 1,
              explanation: 'The 50/30/20 rule suggests allocating 20% of income to savings and debt payoff.'
            },
            {
              question: 'Which of these is considered a "need" in budgeting?',
              options: ['Netflix subscription', 'Dining out', 'Rent/mortgage', 'New clothes'],
              correct: 2,
              explanation: 'Rent or mortgage is essential for housing and is considered a need.'
            }
          ]
        },
        {
          type: 'scenario',
          title: 'Budget Challenge',
          scenario: `You receive a surprise bonus of $500. You've been wanting new headphones ($200), your emergency fund is low, and you have $1,000 in credit card debt.`,
          choices: [
            {
              text: 'Buy the headphones—you deserve a treat!',
              feedback: 'While treats are important, addressing debt and emergency savings should come first.',
              isOptimal: false
            },
            {
              text: 'Put $300 toward credit card debt and $200 to emergency fund',
              feedback: 'Excellent financial decision! You\'re reducing high-interest debt while building security.',
              isOptimal: true
            },
            {
              text: 'Put it all in savings',
              feedback: 'Good savings mindset, but paying off high-interest debt first typically saves more money.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Understanding Credit',
      description: 'Learn how credit works and how to build and maintain a good credit score.',
      difficulty: 'intermediate',
      duration: 40,
      skills: ['credit', 'financial-literacy', 'planning'],
      steps: [
        {
          type: 'content',
          title: 'Credit Score Fundamentals',
          content: `# Your Credit Score Explained

Your credit score is a three-digit number that represents your creditworthiness. It affects your ability to borrow money and the rates you'll pay.

## Credit Score Ranges:
- **800-850**: Exceptional
- **740-799**: Very Good
- **670-739**: Good
- **580-669**: Fair
- **300-579**: Poor

## What Affects Your Score:
1. **Payment History (35%)** - Pay on time, every time
2. **Credit Utilization (30%)** - Keep balances low relative to limits
3. **Length of Credit History (15%)** - Older accounts help
4. **Credit Mix (10%)** - Various types of credit
5. **New Credit (10%)** - Avoid opening many accounts at once

## Building Good Credit:
- Always pay at least the minimum on time
- Keep credit utilization below 30%
- Don't close old accounts
- Check your credit report annually for errors`
        },
        {
          type: 'quiz',
          title: 'Credit Quiz',
          questions: [
            {
              question: 'What factor has the biggest impact on your credit score?',
              options: ['Credit mix', 'Payment history', 'Length of credit history', 'New credit'],
              correct: 1,
              explanation: 'Payment history accounts for 35% of your credit score—the largest factor.'
            },
            {
              question: 'What credit utilization ratio should you aim to stay below?',
              options: ['50%', '30%', '75%', '10%'],
              correct: 1,
              explanation: 'Keeping utilization below 30% is recommended for a healthy credit score.'
            }
          ]
        }
      ]
    },
    {
      title: 'Saving Strategies',
      description: 'Develop habits and strategies to grow your savings consistently.',
      difficulty: 'beginner',
      duration: 30,
      skills: ['saving', 'goal-setting', 'discipline'],
      steps: [
        {
          type: 'content',
          title: 'Pay Yourself First',
          content: `# The Secret to Successful Saving

The key to building savings isn't about having money left over—it's about making saving a priority.

## Pay Yourself First Strategy:
1. Decide on a savings amount/percentage
2. Set up automatic transfers on payday
3. Treat savings like a bill that must be paid
4. Live on what's left after saving

## Types of Savings:
- **Emergency Fund**: 3-6 months of expenses
- **Short-term Goals**: Vacation, new phone, car repair
- **Long-term Goals**: House down payment, retirement

## Making Saving Easier:
- Automate your savings
- Use separate accounts for different goals
- Round up purchases and save the difference
- Challenge yourself with no-spend days/weeks
- Visualize your goals`
        },
        {
          type: 'quiz',
          title: 'Savings Quiz',
          questions: [
            {
              question: 'How many months of expenses should an emergency fund cover?',
              options: ['1-2 months', '3-6 months', '12 months', '2 weeks'],
              correct: 1,
              explanation: 'Financial experts recommend 3-6 months of expenses in an emergency fund.'
            }
          ]
        }
      ]
    },
    {
      title: 'Investment Fundamentals',
      description: 'Understand basic investment concepts and how to grow your wealth over time.',
      difficulty: 'advanced',
      duration: 50,
      skills: ['investing', 'financial-planning', 'risk-assessment'],
      steps: [
        {
          type: 'content',
          title: 'Why Invest?',
          content: `# Growing Your Money Through Investing

Investing allows your money to grow faster than savings accounts by putting it to work in the market.

## The Power of Compound Interest:
$10,000 invested at 7% annual return:
- After 10 years: $19,672
- After 20 years: $38,697
- After 30 years: $76,123

## Key Investment Types:
- **Stocks**: Ownership in companies (higher risk/return)
- **Bonds**: Loans to companies/governments (lower risk/return)
- **Mutual Funds/ETFs**: Baskets of stocks and/or bonds
- **Real Estate**: Property investments
- **Index Funds**: Track market indexes, low fees

## Investment Principles:
1. Start early (time is your greatest asset)
2. Diversify (don't put all eggs in one basket)
3. Keep costs low (fees eat into returns)
4. Stay consistent (invest regularly)
5. Think long-term (ignore short-term volatility)`
        },
        {
          type: 'quiz',
          title: 'Investment Quiz',
          questions: [
            {
              question: 'What is compound interest?',
              options: [
                'Interest only on your initial investment',
                'Interest on both principal and accumulated interest',
                'A fixed interest rate',
                'Interest paid monthly'
              ],
              correct: 1,
              explanation: 'Compound interest means earning interest on your interest, accelerating growth.'
            },
            {
              question: 'What does diversification mean in investing?',
              options: [
                'Investing in one strong company',
                'Spreading investments across different assets',
                'Only investing in stocks',
                'Changing investments frequently'
              ],
              correct: 1,
              explanation: 'Diversification spreads risk by investing in various asset types.'
            }
          ]
        }
      ]
    },
    {
      title: 'Debt Management',
      description: 'Strategies to pay off debt and avoid common debt traps.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['debt-management', 'planning', 'discipline'],
      steps: [
        {
          type: 'content',
          title: 'Understanding and Tackling Debt',
          content: `# Taking Control of Your Debt

Debt isn't inherently bad, but managing it well is crucial for financial health.

## Good Debt vs. Bad Debt:
**Good Debt**: Builds wealth or increases earning potential
- Mortgage (builds equity)
- Student loans (increases earning potential)
- Business loans (generates income)

**Bad Debt**: Depreciating purchases, high interest
- Credit card debt
- Payday loans
- Car loans for luxury vehicles

## Debt Payoff Strategies:

### Avalanche Method:
Pay minimum on all debts, extra on highest interest first
- Saves the most money in interest

### Snowball Method:
Pay minimum on all debts, extra on smallest balance first
- Provides quick psychological wins

## Avoiding Debt Traps:
- Only buy what you can afford
- Use credit cards responsibly (pay in full)
- Avoid payday loans and high-interest options
- Build an emergency fund to avoid debt for surprises`
        },
        {
          type: 'scenario',
          title: 'Debt Payoff Decision',
          scenario: `You have two debts: Card A with $5,000 balance at 22% APR, and Card B with $2,000 balance at 15% APR. You have $200 extra per month to put toward debt.`,
          choices: [
            {
              text: 'Pay extra on Card B first (smaller balance)',
              feedback: 'This is the Snowball method—good for motivation but costs more in interest.',
              isOptimal: false
            },
            {
              text: 'Pay extra on Card A first (higher interest)',
              feedback: 'Correct! The Avalanche method saves the most money by eliminating high-interest debt first.',
              isOptimal: true
            },
            {
              text: 'Split the extra payment between both cards',
              feedback: 'Splitting reduces the effectiveness of either strategy.',
              isOptimal: false
            }
          ]
        }
      ]
    }
  ],
  timeManagement: [
    {
      title: 'Prioritization Mastery',
      description: 'Learn to identify what truly matters and focus your energy effectively.',
      difficulty: 'beginner',
      duration: 30,
      skills: ['prioritization', 'decision-making', 'focus'],
      steps: [
        {
          type: 'content',
          title: 'The Eisenhower Matrix',
          content: `# Prioritizing Like a President

The Eisenhower Matrix helps you decide what deserves your attention by categorizing tasks based on urgency and importance.

## The Four Quadrants:

### Q1: Urgent & Important (DO FIRST)
- Crisis situations
- Deadlines
- Emergency problems
*Handle these immediately*

### Q2: Important but Not Urgent (SCHEDULE)
- Strategic planning
- Relationship building
- Personal development
- Exercise and health
*This is where you should spend most of your time*

### Q3: Urgent but Not Important (DELEGATE)
- Many emails
- Some meetings
- Some phone calls
*Try to delegate or minimize these*

### Q4: Neither Urgent nor Important (ELIMINATE)
- Time wasters
- Excessive social media
- Trivial activities
*Eliminate or strictly limit*

## Key Insight:
Most people spend too much time in Q1 and Q3, and not enough in Q2. Q2 activities prevent Q1 crises.`
        },
        {
          type: 'quiz',
          title: 'Prioritization Quiz',
          questions: [
            {
              question: 'Which quadrant should you spend MOST of your time in?',
              options: ['Urgent & Important', 'Important but Not Urgent', 'Urgent but Not Important', 'Neither'],
              correct: 1,
              explanation: 'Q2 (Important but Not Urgent) activities prevent crises and drive long-term success.'
            },
            {
              question: 'A colleague interrupts you to chat about weekend plans. What quadrant is this?',
              options: ['Q1', 'Q2', 'Q3', 'Q4'],
              correct: 3,
              explanation: 'Social interruptions during work are typically neither urgent nor important (Q4).'
            }
          ]
        }
      ]
    },
    {
      title: 'Goal Setting That Works',
      description: 'Set and achieve meaningful goals using proven frameworks.',
      difficulty: 'beginner',
      duration: 35,
      skills: ['goal-setting', 'planning', 'motivation'],
      steps: [
        {
          type: 'content',
          title: 'SMART Goals Framework',
          content: `# Setting Goals That Stick

Vague goals lead to vague results. SMART goals give you clarity and direction.

## SMART Criteria:

### S - Specific
❌ "Get healthier"
✅ "Exercise 3 times per week for 30 minutes"

### M - Measurable
❌ "Save more money"
✅ "Save $500 per month"

### A - Achievable
Set challenging but realistic goals based on your current situation

### R - Relevant
Goals should align with your values and larger life objectives

### T - Time-bound
❌ "Learn Spanish someday"
✅ "Complete Spanish Level 1 by March 31"

## Breaking Down Big Goals:
1. Define your big goal (1 year)
2. Break into quarterly milestones
3. Set monthly targets
4. Create weekly action items
5. Schedule daily tasks`
        },
        {
          type: 'scenario',
          title: 'Goal Setting Practice',
          scenario: `You want to read more books this year. How would you make this a SMART goal?`,
          choices: [
            {
              text: '"I want to read more"',
              feedback: 'Too vague—not specific or measurable.',
              isOptimal: false
            },
            {
              text: '"I will read 12 books by December 31st, one per month"',
              feedback: 'Great SMART goal! Specific, measurable, and time-bound.',
              isOptimal: true
            },
            {
              text: '"I\'ll try to read when I have time"',
              feedback: 'Without commitment and structure, this is unlikely to happen.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Overcoming Procrastination',
      description: 'Understand why you procrastinate and develop strategies to take action.',
      difficulty: 'intermediate',
      duration: 40,
      skills: ['self-discipline', 'motivation', 'focus'],
      steps: [
        {
          type: 'content',
          title: 'Why We Procrastinate',
          content: `# Understanding the Procrastination Puzzle

Procrastination isn't about laziness—it's often about emotional regulation and fear.

## Common Causes:
- **Fear of failure** - What if I'm not good enough?
- **Perfectionism** - It has to be perfect or not at all
- **Overwhelm** - The task seems too big
- **Lack of clarity** - Not sure where to start
- **Low motivation** - Not connected to personal values
- **Decision fatigue** - Too many choices

## Breaking the Cycle:

### The 2-Minute Rule:
If a task takes less than 2 minutes, do it now.

### The Pomodoro Technique:
1. Choose a task
2. Set timer for 25 minutes
3. Work until timer rings
4. Take 5-minute break
5. Repeat (longer break after 4 cycles)

### Just Start:
Commit to working on something for just 5 minutes. Starting is often the hardest part.`
        },
        {
          type: 'quiz',
          title: 'Procrastination Quiz',
          questions: [
            {
              question: 'What is the 2-Minute Rule?',
              options: [
                'Take a 2-minute break every hour',
                'If a task takes less than 2 minutes, do it now',
                'Spend only 2 minutes planning',
                'Work for 2 minutes then stop'
              ],
              correct: 1,
              explanation: 'The 2-Minute Rule prevents small tasks from piling up.'
            },
            {
              question: 'How long is a standard Pomodoro work session?',
              options: ['15 minutes', '25 minutes', '45 minutes', '60 minutes'],
              correct: 1,
              explanation: 'Traditional Pomodoro technique uses 25-minute focused work sessions.'
            }
          ]
        }
      ]
    },
    {
      title: 'Work-Life Balance',
      description: 'Create boundaries and habits that support both productivity and well-being.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['boundaries', 'self-care', 'time-management'],
      steps: [
        {
          type: 'content',
          title: 'Finding Your Balance',
          content: `# Thriving in Work and Life

Work-life balance isn't about perfect 50/50 splits—it's about intentional choices that honor your priorities.

## Signs of Imbalance:
- Constant exhaustion
- Neglecting relationships
- No time for hobbies
- Feeling resentful about work
- Physical health decline
- Loss of motivation

## Strategies for Balance:

### Set Clear Boundaries:
- Define work hours and stick to them
- Create a dedicated workspace
- Turn off notifications after hours
- Learn to say no

### Protect Your Energy:
- Identify your peak productivity hours
- Schedule demanding work when you're sharpest
- Build in recovery time
- Prioritize sleep

### Be Present:
- When working, focus on work
- When with family/friends, be fully there
- Avoid constant task-switching`
        },
        {
          type: 'scenario',
          title: 'Boundary Setting',
          scenario: `It's 7 PM and you're having dinner with your family when your phone buzzes with a work email. It doesn't seem urgent, but it's from your boss.`,
          choices: [
            {
              text: 'Immediately check and respond to show you\'re dedicated',
              feedback: 'This erodes boundaries and teaches others you\'re always available.',
              isOptimal: false
            },
            {
              text: 'Ignore it completely and never check',
              feedback: 'Some flexibility is okay, but having boundaries doesn\'t mean being unreachable.',
              isOptimal: false
            },
            {
              text: 'Quickly glance to ensure it\'s not urgent, then respond during work hours tomorrow',
              feedback: 'Good balance! You verified it\'s not a crisis while maintaining your personal time.',
              isOptimal: true
            }
          ]
        }
      ]
    },
    {
      title: 'Energy Management',
      description: 'Optimize your physical and mental energy for sustained performance.',
      difficulty: 'advanced',
      duration: 45,
      skills: ['energy-management', 'productivity', 'wellness'],
      steps: [
        {
          type: 'content',
          title: 'Managing Your Energy, Not Just Your Time',
          content: `# Energy: Your Most Valuable Resource

Time management assumes all hours are equal. They're not. Your energy levels dramatically affect what you can accomplish.

## The Four Energy Dimensions:

### Physical Energy (Foundation)
- Sleep (7-9 hours)
- Nutrition
- Exercise
- Recovery

### Emotional Energy
- Self-awareness
- Self-regulation
- Empathy
- Social connections

### Mental Energy
- Focus
- Creativity
- Realistic optimism

### Spiritual Energy
- Purpose
- Values alignment
- Contribution to others

## Energy Management Practices:
1. **Audit your energy** - Track when you feel high/low energy
2. **Match tasks to energy** - Hard work during peak hours
3. **Build renewal rituals** - Short breaks, exercise, meditation
4. **Protect your sleep** - Non-negotiable priority
5. **Manage energy drains** - Limit time with draining people/tasks`
        },
        {
          type: 'quiz',
          title: 'Energy Quiz',
          questions: [
            {
              question: 'According to the four dimensions of energy, which is the foundation?',
              options: ['Mental', 'Emotional', 'Physical', 'Spiritual'],
              correct: 2,
              explanation: 'Physical energy (sleep, nutrition, exercise) is the foundation for all other energy.'
            }
          ]
        }
      ]
    }
  ],
  emotionalIntelligence: [
    {
      title: 'Self-Awareness',
      description: 'Develop deeper understanding of your emotions, triggers, and patterns.',
      difficulty: 'beginner',
      duration: 30,
      skills: ['self-awareness', 'reflection', 'emotional-intelligence'],
      steps: [
        {
          type: 'content',
          title: 'Know Thyself',
          content: `# The Foundation of Emotional Intelligence

Self-awareness is the ability to recognize and understand your own emotions, thoughts, and values, and how they influence your behavior.

## Two Types of Self-Awareness:

### Internal Self-Awareness
- Understanding your values
- Recognizing your emotions
- Knowing your strengths and weaknesses
- Understanding your impact on others

### External Self-Awareness
- Understanding how others see you
- Recognizing how your behavior affects others
- Being open to feedback

## Building Self-Awareness:

### Daily Reflection Questions:
1. What emotions did I experience today?
2. What triggered those emotions?
3. How did I respond? Was it effective?
4. What patterns do I notice?
5. What would I do differently?

### Mindfulness Practice:
- Notice thoughts without judgment
- Observe emotional reactions
- Practice the pause before responding`
        },
        {
          type: 'quiz',
          title: 'Self-Awareness Quiz',
          questions: [
            {
              question: 'What are the two types of self-awareness?',
              options: [
                'Emotional and logical',
                'Internal and external',
                'Personal and professional',
                'Past and present'
              ],
              correct: 1,
              explanation: 'Internal self-awareness is how you see yourself; external is how others see you.'
            }
          ]
        }
      ]
    },
    {
      title: 'Empathy in Action',
      description: 'Develop the ability to understand and share the feelings of others.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['empathy', 'perspective-taking', 'compassion'],
      steps: [
        {
          type: 'content',
          title: 'Understanding Empathy',
          content: `# Walking in Others' Shoes

Empathy is the ability to understand and share the feelings of another person. It's essential for building strong relationships and effective communication.

## Types of Empathy:

### Cognitive Empathy
Understanding another person's perspective intellectually

### Emotional Empathy
Actually feeling what another person is feeling

### Compassionate Empathy
Understanding + feeling + being moved to help

## Barriers to Empathy:
- Being distracted or busy
- Judgment or prejudice
- Focusing on your own response
- Fatigue or stress
- Assuming you know how they feel

## Building Empathy:

### Ask Curious Questions:
"How did that make you feel?"
"What was that like for you?"
"Help me understand..."

### Practice Perspective-Taking:
Before reacting, ask yourself:
- What might they be experiencing?
- What would I feel in their situation?
- What do they need right now?`
        },
        {
          type: 'scenario',
          title: 'Empathy Practice',
          scenario: `A friend tells you they didn't get the job they really wanted. They seem really down about it.`,
          choices: [
            {
              text: '"You\'ll find something better! Everything happens for a reason!"',
              feedback: 'While well-intentioned, this dismisses their feelings and jumps to silver linings.',
              isOptimal: false
            },
            {
              text: '"That\'s really disappointing. You put so much effort into that application. How are you feeling?"',
              feedback: 'Great empathetic response! You acknowledge their feelings and invite them to share more.',
              isOptimal: true
            },
            {
              text: '"Well, the job market is tough right now. Lots of people are struggling."',
              feedback: 'This minimizes their personal experience by generalizing.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Stress Management',
      description: 'Build resilience and healthy coping strategies for managing stress.',
      difficulty: 'intermediate',
      duration: 40,
      skills: ['stress-management', 'resilience', 'self-care'],
      steps: [
        {
          type: 'content',
          title: 'Understanding Stress',
          content: `# Managing Stress Effectively

Stress is a natural response to challenges. The goal isn't to eliminate stress, but to manage it effectively.

## Types of Stress:
- **Acute Stress**: Short-term, response to immediate challenge
- **Chronic Stress**: Long-term, ongoing pressures
- **Eustress**: Positive stress that motivates and excites

## Signs of Unhealthy Stress:
### Physical:
- Headaches, muscle tension
- Sleep problems
- Fatigue
- Digestive issues

### Emotional:
- Anxiety, worry
- Irritability
- Feeling overwhelmed
- Depression

### Behavioral:
- Changes in appetite
- Procrastination
- Social withdrawal
- Unhealthy coping (substances, overeating)

## Healthy Coping Strategies:

### Immediate Relief:
- Deep breathing (4-7-8 technique)
- Progressive muscle relaxation
- Quick walk outside
- Grounding techniques

### Long-term Resilience:
- Regular exercise
- Quality sleep
- Social connections
- Mindfulness practice
- Time in nature`
        },
        {
          type: 'content',
          title: 'The 4-7-8 Breathing Technique',
          content: `# Calm Your Nervous System in Minutes

The 4-7-8 breathing technique activates your parasympathetic nervous system, reducing stress and anxiety.

## How to Practice:

1. **Inhale** through your nose for **4 counts**
2. **Hold** your breath for **7 counts**
3. **Exhale** through your mouth for **8 counts**
4. Repeat 3-4 times

## When to Use:
- Before stressful situations (presentations, meetings)
- When feeling anxious
- Before bed to promote sleep
- When feeling overwhelmed

## Why It Works:
- Extends the exhale, activating relaxation response
- Forces focus on breath, interrupting anxious thoughts
- Increases oxygen to the brain
- Lowers heart rate and blood pressure`
        },
        {
          type: 'quiz',
          title: 'Stress Quiz',
          questions: [
            {
              question: 'In the 4-7-8 breathing technique, how long do you hold your breath?',
              options: ['4 counts', '7 counts', '8 counts', '10 counts'],
              correct: 1,
              explanation: 'The 4-7-8 pattern is: inhale 4, hold 7, exhale 8.'
            },
            {
              question: 'What type of stress can actually be beneficial?',
              options: ['Chronic stress', 'Acute stress', 'Eustress', 'Distress'],
              correct: 2,
              explanation: 'Eustress is positive stress that motivates and helps performance.'
            }
          ]
        }
      ]
    },
    {
      title: 'Resilience Building',
      description: 'Develop the mental strength to bounce back from setbacks.',
      difficulty: 'advanced',
      duration: 45,
      skills: ['resilience', 'growth-mindset', 'adaptability'],
      steps: [
        {
          type: 'content',
          title: 'The Science of Resilience',
          content: `# Bouncing Back Stronger

Resilience isn't about avoiding difficulties—it's about developing the capacity to recover from them and grow in the process.

## Characteristics of Resilient People:
- **Realistic Optimism**: Hope grounded in reality
- **Strong Support Network**: Connections with others
- **Adaptability**: Flexibility in response to change
- **Purpose**: Sense of meaning and direction
- **Self-Efficacy**: Belief in ability to cope
- **Emotional Regulation**: Managing difficult feelings

## Building Resilience:

### 1. Reframe Challenges
View setbacks as opportunities for growth, not permanent failures.

### 2. Build Your Support Network
Cultivate relationships with people who support and encourage you.

### 3. Take Care of Yourself
Physical health supports mental resilience.

### 4. Find Meaning
Connect to something larger than yourself.

### 5. Embrace a Growth Mindset
Believe that abilities can be developed through effort.

## The Post-Traumatic Growth Model:
People often report positive changes after difficult experiences:
- Greater appreciation for life
- Improved relationships
- New possibilities
- Personal strength
- Spiritual development`
        },
        {
          type: 'scenario',
          title: 'Resilience in Action',
          scenario: `You've just been laid off from your job unexpectedly. You're feeling shocked and worried about the future.`,
          choices: [
            {
              text: 'Panic and immediately apply to any job available',
              feedback: 'Reactive decisions during stress often lead to poor outcomes.',
              isOptimal: false
            },
            {
              text: 'Allow yourself to process the shock, then create a thoughtful plan for next steps',
              feedback: 'Great resilience! Acknowledging emotions while maintaining agency leads to better outcomes.',
              isOptimal: true
            },
            {
              text: 'Pretend everything is fine and don\'t tell anyone',
              feedback: 'Avoiding emotions and isolating yourself reduces resilience.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Emotional Regulation',
      description: 'Learn to manage and respond to emotions in healthy ways.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['emotional-regulation', 'self-control', 'mindfulness'],
      steps: [
        {
          type: 'content',
          title: 'Managing Your Emotions',
          content: `# From Reaction to Response

Emotional regulation is the ability to manage your emotional reactions to situations. It doesn't mean suppressing emotions—it means responding thoughtfully rather than reacting impulsively.

## The Emotional Response Process:
1. **Trigger** - Something happens
2. **Interpretation** - How you perceive it
3. **Emotion** - What you feel
4. **Response** - What you do

## Strategies for Regulation:

### Before the Emotion:
- **Situation Selection**: Avoid triggering situations when possible
- **Situation Modification**: Change aspects of a situation
- **Attention Deployment**: Shift focus away from triggers

### During the Emotion:
- **Cognitive Reappraisal**: Change how you think about the situation
- **The Pause**: Create space between trigger and response
- **Naming Emotions**: "I'm feeling frustrated" (reduces intensity)

### After the Emotion:
- **Response Modulation**: Change your behavioral response
- **Physical Release**: Exercise, walk, or movement
- **Social Support**: Talk to someone you trust`
        },
        {
          type: 'quiz',
          title: 'Emotional Regulation Quiz',
          questions: [
            {
              question: 'What is "cognitive reappraisal"?',
              options: [
                'Ignoring your emotions',
                'Changing how you think about a situation',
                'Talking to a therapist',
                'Avoiding difficult situations'
              ],
              correct: 1,
              explanation: 'Cognitive reappraisal means reframing your interpretation of a situation.'
            }
          ]
        }
      ]
    }
  ],
  careerReadiness: [
    {
      title: 'Resume Writing',
      description: 'Create a compelling resume that showcases your value to employers.',
      difficulty: 'beginner',
      duration: 40,
      skills: ['resume', 'professional-writing', 'self-presentation'],
      steps: [
        {
          type: 'content',
          title: 'Resume Fundamentals',
          content: `# Creating a Resume That Gets Noticed

Your resume is often your first impression. Make it count.

## Essential Resume Sections:

### 1. Contact Information
- Name (prominent)
- Phone number
- Professional email
- LinkedIn URL (optional)
- Location (city, state is sufficient)

### 2. Professional Summary (Optional)
2-3 sentences highlighting your value proposition

### 3. Work Experience
- Company name, title, dates
- 3-5 bullet points per role
- Start with strong action verbs
- Quantify achievements when possible

### 4. Education
- Degree, school, graduation date
- Relevant coursework or honors

### 5. Skills
- Technical skills
- Language proficiencies
- Certifications

## The STAR Format for Bullets:
**S**ituation → **T**ask → **A**ction → **R**esult

Example:
❌ "Responsible for customer service"
✅ "Improved customer satisfaction scores by 25% by implementing new response protocols"`
        },
        {
          type: 'quiz',
          title: 'Resume Quiz',
          questions: [
            {
              question: 'What does STAR stand for in resume writing?',
              options: [
                'Skills, Training, Achievements, References',
                'Situation, Task, Action, Result',
                'Summary, Timeline, Activities, Results',
                'Strengths, Talents, Abilities, Recognition'
              ],
              correct: 1,
              explanation: 'STAR helps structure achievement-focused bullet points.'
            },
            {
              question: 'Which resume bullet is stronger?',
              options: [
                '"Responsible for managing projects"',
                '"Managed 12 projects worth $2M, delivering all on time and under budget"',
                '"Good at project management"',
                '"Helped with various projects"'
              ],
              correct: 1,
              explanation: 'Quantified achievements with specific results are most impactful.'
            }
          ]
        }
      ]
    },
    {
      title: 'Interview Skills',
      description: 'Prepare for and excel in job interviews.',
      difficulty: 'intermediate',
      duration: 50,
      skills: ['interviewing', 'communication', 'self-presentation'],
      steps: [
        {
          type: 'content',
          title: 'Interview Preparation',
          content: `# Ace Your Next Interview

Preparation is the key to interview success. Here's how to get ready.

## Before the Interview:

### Research the Company
- Company mission and values
- Recent news and developments
- Products/services
- Company culture
- Interviewer backgrounds (LinkedIn)

### Prepare Your Stories
Use the STAR method to prepare stories for common questions:
- Tell me about yourself
- Why do you want this role?
- Describe a challenge you overcame
- Tell me about a time you showed leadership
- What's your greatest strength/weakness?

### Prepare Questions to Ask
- What does success look like in this role?
- What's the team culture like?
- What are the biggest challenges for this position?
- What's the growth path for this role?

## Day of Interview:
- Dress appropriately (when in doubt, dress up)
- Arrive 10-15 minutes early
- Bring copies of your resume
- Have questions prepared
- Silence your phone`
        },
        {
          type: 'scenario',
          title: 'Tricky Interview Question',
          scenario: `The interviewer asks: "What's your greatest weakness?"`,
          choices: [
            {
              text: '"I\'m a perfectionist" or "I work too hard"',
              feedback: 'These clichés come across as insincere and don\'t show self-awareness.',
              isOptimal: false
            },
            {
              text: '"I have trouble meeting deadlines and sometimes miss important details"',
              feedback: 'Too honest—this raises red flags without showing growth.',
              isOptimal: false
            },
            {
              text: '"I used to struggle with delegating, but I\'ve been working on it by [specific action] and have seen improvement"',
              feedback: 'Great answer! Shows self-awareness, growth mindset, and concrete steps to improve.',
              isOptimal: true
            }
          ]
        },
        {
          type: 'quiz',
          title: 'Interview Quiz',
          questions: [
            {
              question: 'How early should you arrive to an interview?',
              options: ['5 minutes', '10-15 minutes', '30 minutes', 'Exactly on time'],
              correct: 1,
              explanation: '10-15 minutes early shows punctuality without being too early.'
            }
          ]
        }
      ]
    },
    {
      title: 'Networking Essentials',
      description: 'Build and maintain professional relationships that advance your career.',
      difficulty: 'intermediate',
      duration: 35,
      skills: ['networking', 'relationship-building', 'communication'],
      steps: [
        {
          type: 'content',
          title: 'The Art of Professional Networking',
          content: `# Building Meaningful Professional Connections

Networking isn't about collecting business cards—it's about building genuine relationships.

## Why Networking Matters:
- 70-80% of jobs are found through networking
- Provides industry insights and opportunities
- Offers mentorship and support
- Accelerates career growth

## Networking Mindset Shift:
❌ "What can I get from this person?"
✅ "How can I add value to this relationship?"

## Where to Network:
- Industry conferences and events
- Professional associations
- LinkedIn and social media
- Alumni networks
- Volunteering
- Informational interviews

## Networking Best Practices:

### Starting Conversations:
- Ask about their work and interests
- Look for common ground
- Be genuinely curious
- Listen more than you talk

### Following Up:
- Send a personalized message within 24-48 hours
- Reference something specific from your conversation
- Offer something of value (article, introduction)
- Stay in touch periodically (not just when you need something)`
        },
        {
          type: 'quiz',
          title: 'Networking Quiz',
          questions: [
            {
              question: 'What percentage of jobs are found through networking?',
              options: ['30-40%', '50-60%', '70-80%', '90%+'],
              correct: 2,
              explanation: 'Studies show 70-80% of jobs are found through networking connections.'
            }
          ]
        }
      ]
    },
    {
      title: 'Professional Etiquette',
      description: 'Navigate workplace norms and build a professional reputation.',
      difficulty: 'beginner',
      duration: 30,
      skills: ['professionalism', 'etiquette', 'workplace-skills'],
      steps: [
        {
          type: 'content',
          title: 'Workplace Professionalism',
          content: `# Building Your Professional Reputation

Professionalism is about how you conduct yourself in the workplace. It affects how colleagues perceive you and your career opportunities.

## Key Aspects of Professionalism:

### Communication:
- Respond to emails within 24 hours
- Use proper grammar and spelling
- Be concise and clear
- Match communication style to audience

### Reliability:
- Meet deadlines
- Show up on time
- Follow through on commitments
- If you can't deliver, communicate early

### Attitude:
- Be positive and solution-oriented
- Accept feedback gracefully
- Take responsibility for mistakes
- Avoid gossip and negativity

### Appearance:
- Dress appropriately for your workplace
- Maintain good hygiene
- Be mindful of your digital presence

## Email Etiquette:
- Clear, specific subject lines
- Professional greeting
- Get to the point quickly
- Proofread before sending
- Use "Reply All" sparingly`
        },
        {
          type: 'scenario',
          title: 'Workplace Scenario',
          scenario: `You made a mistake on a project that caused a delay. Your manager asks what happened.`,
          choices: [
            {
              text: 'Blame a coworker who gave you wrong information',
              feedback: 'Blaming others damages trust and your reputation.',
              isOptimal: false
            },
            {
              text: 'Acknowledge the mistake, explain what happened, and propose how to prevent it in the future',
              feedback: 'Taking responsibility and showing a path forward demonstrates professionalism and maturity.',
              isOptimal: true
            },
            {
              text: 'Minimize the mistake and hope no one notices the full impact',
              feedback: 'This could make the situation worse and damage trust if discovered.',
              isOptimal: false
            }
          ]
        }
      ]
    },
    {
      title: 'Career Planning',
      description: 'Create a strategic plan for your career growth and development.',
      difficulty: 'advanced',
      duration: 45,
      skills: ['career-planning', 'goal-setting', 'self-assessment'],
      steps: [
        {
          type: 'content',
          title: 'Charting Your Career Path',
          content: `# Strategic Career Planning

A career doesn't just happen—successful careers are built with intention and strategy.

## Career Planning Framework:

### 1. Self-Assessment
- What are your strengths?
- What do you enjoy doing?
- What are your values?
- What work environments suit you?

### 2. Exploration
- What careers align with your profile?
- What industries interest you?
- What roles combine your skills and interests?

### 3. Goal Setting
- Where do you want to be in 1/5/10 years?
- What skills do you need to develop?
- What experiences will help you get there?

### 4. Action Planning
- What steps will you take?
- What resources do you need?
- Who can help you?

## Career Development Strategies:
- Seek stretch assignments
- Find mentors and sponsors
- Build your personal brand
- Continue learning (courses, certifications)
- Network strategically
- Regularly reassess and adjust`
        },
        {
          type: 'quiz',
          title: 'Career Planning Quiz',
          questions: [
            {
              question: 'What should be the FIRST step in career planning?',
              options: ['Applying to jobs', 'Self-assessment', 'Networking', 'Getting certifications'],
              correct: 1,
              explanation: 'Self-assessment helps you understand what careers align with your strengths and values.'
            }
          ]
        }
      ]
    }
  ]
};

// ============================================================
// BADGE DEFINITIONS
// ============================================================

const BADGES = [
  // Communication Badges
  { name: 'First Words', description: 'Complete your first communication module', category: 'communication', xp_required: 100, icon: '💬' },
  { name: 'Active Listener', description: 'Master the art of active listening', category: 'communication', xp_required: 250, icon: '👂' },
  { name: 'Public Speaker', description: 'Complete all public speaking modules', category: 'communication', xp_required: 500, icon: '🎤' },
  { name: 'Conflict Resolver', description: 'Learn to resolve conflicts effectively', category: 'communication', xp_required: 400, icon: '🤝' },
  { name: 'Communication Master', description: 'Complete all communication modules', category: 'communication', xp_required: 1000, icon: '🏆' },

  // Financial Badges
  { name: 'Budget Beginner', description: 'Create your first budget', category: 'financial', xp_required: 100, icon: '💰' },
  { name: 'Savings Star', description: 'Learn saving strategies', category: 'financial', xp_required: 250, icon: '⭐' },
  { name: 'Credit Wise', description: 'Understand credit scores', category: 'financial', xp_required: 400, icon: '📊' },
  { name: 'Investment Initiate', description: 'Learn investment basics', category: 'financial', xp_required: 500, icon: '📈' },
  { name: 'Financial Master', description: 'Complete all financial modules', category: 'financial', xp_required: 1000, icon: '💎' },

  // Time Management Badges
  { name: 'Priority Pro', description: 'Learn to prioritize effectively', category: 'time-management', xp_required: 100, icon: '🎯' },
  { name: 'Goal Getter', description: 'Set and achieve your first goal', category: 'time-management', xp_required: 250, icon: '🏅' },
  { name: 'Procrastination Buster', description: 'Overcome procrastination', category: 'time-management', xp_required: 400, icon: '⚡' },
  { name: 'Balance Master', description: 'Achieve work-life balance', category: 'time-management', xp_required: 500, icon: '⚖️' },
  { name: 'Time Master', description: 'Complete all time management modules', category: 'time-management', xp_required: 1000, icon: '⏰' },

  // Emotional Intelligence Badges
  { name: 'Self-Aware', description: 'Develop self-awareness', category: 'emotional-intelligence', xp_required: 100, icon: '🪞' },
  { name: 'Empathy Expert', description: 'Master empathetic communication', category: 'emotional-intelligence', xp_required: 250, icon: '💝' },
  { name: 'Stress Warrior', description: 'Learn stress management', category: 'emotional-intelligence', xp_required: 400, icon: '🧘' },
  { name: 'Resilient One', description: 'Build resilience skills', category: 'emotional-intelligence', xp_required: 500, icon: '💪' },
  { name: 'EQ Master', description: 'Complete all emotional intelligence modules', category: 'emotional-intelligence', xp_required: 1000, icon: '🧠' },

  // Career Readiness Badges
  { name: 'Resume Writer', description: 'Create a professional resume', category: 'career', xp_required: 100, icon: '📝' },
  { name: 'Interview Ready', description: 'Prepare for interviews', category: 'career', xp_required: 250, icon: '🎤' },
  { name: 'Network Builder', description: 'Learn networking skills', category: 'career', xp_required: 400, icon: '🌐' },
  { name: 'Professional', description: 'Master workplace etiquette', category: 'career', xp_required: 500, icon: '👔' },
  { name: 'Career Master', description: 'Complete all career modules', category: 'career', xp_required: 1000, icon: '🚀' }
];

// ============================================================
// NAME GENERATORS
// ============================================================

const FIRST_NAMES = [
  'Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason',
  'Isabella', 'William', 'Mia', 'James', 'Charlotte', 'Benjamin', 'Amelia',
  'Lucas', 'Harper', 'Henry', 'Evelyn', 'Alexander', 'Luna', 'Michael',
  'Camila', 'Daniel', 'Gianna', 'Matthew', 'Sofia', 'Sebastian', 'Aria',
  'David', 'Scarlett', 'Joseph', 'Victoria', 'Samuel', 'Madison', 'Owen',
  'Layla', 'Jackson', 'Grace', 'Gabriel', 'Chloe', 'Carter', 'Penelope',
  'Jayden', 'Riley', 'John', 'Zoey', 'Luke', 'Nora', 'Anthony', 'Lily',
  'Isaac', 'Eleanor', 'Dylan', 'Hannah', 'Wyatt', 'Lillian', 'Andrew',
  'Addison', 'Joshua', 'Aubrey', 'Christopher', 'Ellie', 'Grayson', 'Stella',
  'Jack', 'Natalie', 'Julian', 'Leah', 'Lincoln', 'Hazel', 'Ryan', 'Violet',
  'Jaxon', 'Aurora', 'Leo', 'Savannah', 'Nathan', 'Audrey', 'Aaron', 'Brooklyn'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis',
  'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson',
  'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 'Lee', 'Perez', 'Thompson',
  'White', 'Harris', 'Sanchez', 'Clark', 'Ramirez', 'Lewis', 'Robinson',
  'Walker', 'Young', 'Allen', 'King', 'Wright', 'Scott', 'Torres', 'Nguyen',
  'Hill', 'Flores', 'Green', 'Adams', 'Nelson', 'Baker', 'Hall', 'Rivera',
  'Campbell', 'Mitchell', 'Carter', 'Roberts', 'Chen', 'Kim', 'Park', 'Patel'
];

function generateName(): { first: string; last: string } {
  return {
    first: randomElement(FIRST_NAMES),
    last: randomElement(LAST_NAMES)
  };
}

// ============================================================
// MAIN SEEDING FUNCTIONS
// ============================================================

interface SeedData {
  organizations: { id: string; name: string; slug: string }[];
  users: { id: string; email: string; role: string; orgId: string; name: string }[];
  classes: { id: string; name: string; teacherId: string; orgId: string; code: string }[];
  modules: { id: string; title: string; difficulty: string; category: string }[];
  badges: { id: string; name: string; category: string }[];
}

async function seedOrganizations(): Promise<SeedData['organizations']> {
  console.log('🏢 Creating organizations...');

  const orgs = [
    { name: 'TouchBase Academy', slug: 'touchbase-academy' },
    { name: 'Demo High School', slug: 'demo-high-school' },
    { name: 'Community Learning Center', slug: 'community-learning' },
    { name: 'Youth Development Program', slug: 'youth-program' },
    { name: 'Test Organization', slug: 'test-org' }
  ];

  const createdOrgs: SeedData['organizations'] = [];

  for (const org of orgs) {
    const id = generateUUID();
    const { error } = await supabase
      .from('touchbase_organizations')
      .upsert({ id, ...org }, { onConflict: 'slug' });

    if (error) {
      console.error(`Error creating org ${org.name}:`, error.message);
    } else {
      createdOrgs.push({ id, ...org });
      console.log(`  ✅ ${org.name}`);
    }
  }

  return createdOrgs;
}

async function seedUsers(orgs: SeedData['organizations']): Promise<SeedData['users']> {
  console.log('\n👥 Creating users...');

  const createdUsers: SeedData['users'] = [];
  const mainOrg = orgs[0];

  // Helper to create a user
  async function createUser(email: string, role: string, orgId: string, fullName: string) {
    const id = generateUUID();

    // Create profile
    const { error: profileError } = await supabase
      .from('touchbase_profiles')
      .upsert({
        id,
        email,
        full_name: fullName,
        default_org_id: orgId
      }, { onConflict: 'id' });

    if (profileError && !profileError.message.includes('duplicate')) {
      console.error(`Error creating profile for ${email}:`, profileError.message);
      return null;
    }

    // Create membership
    const { error: memberError } = await supabase
      .from('touchbase_memberships')
      .upsert({
        org_id: orgId,
        user_id: id,
        role
      }, { onConflict: 'org_id,user_id' });

    if (memberError && !memberError.message.includes('duplicate')) {
      console.error(`Error creating membership for ${email}:`, memberError.message);
    }

    return { id, email, role, orgId, name: fullName };
  }

  // Create admin users (5)
  console.log('  Creating admins...');
  for (let i = 1; i <= 5; i++) {
    const name = generateName();
    const email = `admin${i}@touchbase.academy`;
    const user = await createUser(email, 'owner', mainOrg.id, `${name.first} ${name.last}`);
    if (user) createdUsers.push(user);
  }
  console.log(`  ✅ ${5} admins created`);

  // Create teachers (15)
  console.log('  Creating teachers...');
  for (let i = 1; i <= 15; i++) {
    const name = generateName();
    const orgId = orgs[i % orgs.length].id;
    const email = `teacher${i}@touchbase.academy`;
    const user = await createUser(email, 'teacher', orgId, `${name.first} ${name.last}`);
    if (user) createdUsers.push(user);
  }
  console.log(`  ✅ ${15} teachers created`);

  // Create students (80)
  console.log('  Creating students...');
  for (let i = 1; i <= 80; i++) {
    const name = generateName();
    const orgId = orgs[i % orgs.length].id;
    const email = `student${i}@touchbase.academy`;
    const user = await createUser(email, 'student', orgId, `${name.first} ${name.last}`);
    if (user) createdUsers.push(user);
  }
  console.log(`  ✅ ${80} students created`);

  return createdUsers;
}

async function seedClasses(users: SeedData['users'], orgs: SeedData['organizations']): Promise<SeedData['classes']> {
  console.log('\n📚 Creating classes...');

  const teachers = users.filter(u => u.role === 'teacher');
  const students = users.filter(u => u.role === 'student');
  const createdClasses: SeedData['classes'] = [];

  const classNames = [
    'Life Skills 101', 'Financial Basics', 'Communication Workshop',
    'Career Preparation', 'Emotional Intelligence', 'Time Mastery',
    'Leadership Development', 'Personal Finance', 'Public Speaking',
    'Conflict Resolution', 'Stress Management', 'Goal Setting',
    'Resume Building', 'Interview Prep', 'Networking 101',
    'Budgeting Basics', 'Credit & Debt', 'Investment Intro',
    'Self-Awareness', 'Empathy Workshop', 'Resilience Training',
    'Work-Life Balance', 'Productivity Hacks', 'Mindfulness',
    'Professional Etiquette'
  ];

  for (let i = 0; i < classNames.length && i < teachers.length * 2; i++) {
    const teacher = teachers[Math.floor(i / 2)];
    const id = generateUUID();
    const code = generateClassCode();

    const { error } = await supabase
      .from('touchbase_classes')
      .upsert({
        id,
        name: classNames[i],
        org_id: teacher.orgId,
        teacher_id: teacher.id,
        code,
        grade_level: `Grade ${9 + (i % 4)}`,
        description: `Learn essential ${classNames[i].toLowerCase()} skills for personal and professional success.`
      }, { onConflict: 'id' });

    if (error) {
      console.error(`Error creating class ${classNames[i]}:`, error.message);
    } else {
      createdClasses.push({ id, name: classNames[i], teacherId: teacher.id, orgId: teacher.orgId, code });
    }
  }

  console.log(`  ✅ ${createdClasses.length} classes created`);

  // Enroll students in classes
  console.log('  Enrolling students...');
  let enrollmentCount = 0;

  for (const cls of createdClasses) {
    const classStudents = students
      .filter(s => s.orgId === cls.orgId)
      .slice(0, randomInt(5, 8));

    for (const student of classStudents) {
      const { error } = await supabase
        .from('touchbase_class_enrollments')
        .upsert({
          class_id: cls.id,
          student_id: student.id,
          enrolled_at: randomDate(new Date('2024-09-01'), new Date()).toISOString()
        }, { onConflict: 'class_id,student_id' });

      if (!error) enrollmentCount++;
    }
  }

  console.log(`  ✅ ${enrollmentCount} enrollments created`);

  return createdClasses;
}

async function seedModules(): Promise<SeedData['modules']> {
  console.log('\n📖 Creating modules with real life skills content...');

  const createdModules: SeedData['modules'] = [];
  const allCategories = Object.entries(LIFE_SKILLS_MODULES);

  for (const [category, modules] of allCategories) {
    console.log(`  📁 ${category}...`);

    for (const module of modules) {
      const moduleId = generateUUID();

      // Create module
      const { error: moduleError } = await supabase
        .from('touchbase_modules')
        .upsert({
          id: moduleId,
          title: module.title,
          description: module.description,
          difficulty: module.difficulty,
          duration_minutes: module.duration,
          skills: module.skills,
          is_active: true,
          created_at: new Date().toISOString()
        }, { onConflict: 'id' });

      if (moduleError) {
        console.error(`Error creating module ${module.title}:`, moduleError.message);
        continue;
      }

      createdModules.push({ id: moduleId, title: module.title, difficulty: module.difficulty, category });

      // Create steps for this module
      for (let stepIndex = 0; stepIndex < module.steps.length; stepIndex++) {
        const step = module.steps[stepIndex];
        const stepId = generateUUID();

        let content: Record<string, unknown> = {};

        if (step.type === 'content') {
          content = { text: step.content };
        } else if (step.type === 'quiz') {
          content = { questions: (step as { questions: unknown[] }).questions };
        } else if (step.type === 'scenario') {
          content = {
            scenario: (step as { scenario: string }).scenario,
            choices: (step as { choices: unknown[] }).choices
          };
        }

        await supabase
          .from('touchbase_module_steps')
          .upsert({
            id: stepId,
            module_id: moduleId,
            title: step.title,
            step_type: step.type,
            content_data: content,
            order_index: stepIndex
          }, { onConflict: 'id' });
      }
    }
  }

  console.log(`  ✅ ${createdModules.length} modules with ${createdModules.length * 3} steps created`);

  return createdModules;
}

async function seedBadges(): Promise<SeedData['badges']> {
  console.log('\n🏅 Creating badges...');

  const createdBadges: SeedData['badges'] = [];

  for (const badge of BADGES) {
    const id = generateUUID();

    const { error } = await supabase
      .from('touchbase_badges')
      .upsert({
        id,
        name: badge.name,
        description: badge.description,
        category: badge.category,
        xp_required: badge.xp_required,
        icon_url: badge.icon,
        is_active: true
      }, { onConflict: 'id' });

    if (error) {
      console.error(`Error creating badge ${badge.name}:`, error.message);
    } else {
      createdBadges.push({ id, name: badge.name, category: badge.category });
    }
  }

  console.log(`  ✅ ${createdBadges.length} badges created`);

  return createdBadges;
}

async function seedProgressAndXP(
  users: SeedData['users'],
  modules: SeedData['modules'],
  badges: SeedData['badges']
): Promise<void> {
  console.log('\n📊 Creating progress records, XP, and badge awards...');

  const students = users.filter(u => u.role === 'student');
  let progressCount = 0;
  let badgeCount = 0;

  for (const student of students) {
    // Each student completes 3-8 random modules
    const numModules = randomInt(3, 8);
    const studentModules = [...modules].sort(() => Math.random() - 0.5).slice(0, numModules);
    let totalXP = 0;

    for (const module of studentModules) {
      const isComplete = Math.random() > 0.3;
      const progressPercent = isComplete ? 100 : randomInt(20, 80);
      const xpEarned = isComplete ? randomInt(80, 150) : randomInt(10, 50);
      totalXP += xpEarned;

      const { error } = await supabase
        .from('touchbase_progress')
        .upsert({
          id: generateUUID(),
          user_id: student.id,
          module_id: module.id,
          status: isComplete ? 'completed' : 'in_progress',
          completion_percentage: progressPercent,
          step_progress: JSON.stringify([{ step: isComplete ? 3 : randomInt(1, 2), completed: isComplete }]),
          xp_earned: xpEarned,
          started_at: randomDate(new Date('2024-09-01'), new Date()).toISOString(),
          completed_at: isComplete ? randomDate(new Date('2024-10-01'), new Date()).toISOString() : null
        }, { onConflict: 'user_id,module_id' });

      if (!error) progressCount++;
    }

    // Update user XP
    await supabase
      .from('touchbase_profiles')
      .update({
        total_xp: totalXP,
        level: Math.floor(totalXP / 200) + 1
      })
      .eq('id', student.id);

    // Award badges based on XP
    const eligibleBadges = badges.filter(b => {
      const badgeDef = BADGES.find(bd => bd.name === b.name);
      return badgeDef && badgeDef.xp_required <= totalXP;
    });

    for (const badge of eligibleBadges.slice(0, randomInt(1, 3))) {
      const { error } = await supabase
        .from('touchbase_user_badges')
        .upsert({
          user_id: student.id,
          badge_id: badge.id,
          earned_at: randomDate(new Date('2024-10-01'), new Date()).toISOString()
        }, { onConflict: 'user_id,badge_id' });

      if (!error) badgeCount++;
    }
  }

  console.log(`  ✅ ${progressCount} progress records created`);
  console.log(`  ✅ ${badgeCount} badges awarded`);
}

async function seedAttendance(
  users: SeedData['users'],
  classes: SeedData['classes']
): Promise<void> {
  console.log('\n📅 Creating attendance records...');

  let attendanceCount = 0;
  const startDate = new Date('2024-09-01');
  const endDate = new Date();
  const statuses = ['present', 'present', 'present', 'present', 'absent', 'late', 'excused'];

  // Get class enrollments
  for (const cls of classes) {
    const { data: enrollments } = await supabase
      .from('touchbase_class_enrollments')
      .select('student_id')
      .eq('class_id', cls.id);

    if (!enrollments) continue;

    // Create attendance for 60 days
    for (let day = 0; day < 60; day++) {
      const date = addDays(startDate, day);
      if (date > endDate) break;
      if (date.getDay() === 0 || date.getDay() === 6) continue; // Skip weekends

      for (const enrollment of enrollments) {
        const { error } = await supabase
          .from('touchbase_attendance')
          .upsert({
            id: generateUUID(),
            class_id: cls.id,
            student_id: enrollment.student_id,
            date: date.toISOString().split('T')[0],
            status: randomElement(statuses),
            marked_by: cls.teacherId
          }, { onConflict: 'class_id,student_id,date' });

        if (!error) attendanceCount++;
      }
    }
  }

  console.log(`  ✅ ${attendanceCount} attendance records created`);
}

async function seedAssignments(
  classes: SeedData['classes'],
  modules: SeedData['modules']
): Promise<void> {
  console.log('\n📝 Creating assignments...');

  let assignmentCount = 0;
  const now = new Date();

  for (const cls of classes) {
    // Assign 3-6 modules to each class
    const classModules = [...modules].sort(() => Math.random() - 0.5).slice(0, randomInt(3, 6));

    for (const module of classModules) {
      // First, assign module to class
      await supabase
        .from('touchbase_class_modules')
        .upsert({
          class_id: cls.id,
          module_id: module.id,
          assigned_at: randomDate(new Date('2024-09-01'), now).toISOString()
        }, { onConflict: 'class_id,module_id' });

      // Create assignment with varying due dates
      const daysOffset = randomInt(-7, 21); // Some past (overdue), some future
      const dueDate = addDays(now, daysOffset);

      const { error } = await supabase
        .from('touchbase_assignments')
        .upsert({
          id: generateUUID(),
          class_id: cls.id,
          module_id: module.id,
          title: `Complete: ${module.title}`,
          description: `Complete all steps of the ${module.title} module and reflect on your learning.`,
          due_date: dueDate.toISOString(),
          assigned_at: randomDate(new Date('2024-09-01'), now).toISOString(),
          teacher_id: cls.teacherId
        }, { onConflict: 'id' });

      if (!error) assignmentCount++;
    }
  }

  console.log(`  ✅ ${assignmentCount} assignments created`);
}

async function seedSchedules(classes: SeedData['classes']): Promise<void> {
  console.log('\n🗓️ Creating schedules...');

  let scheduleCount = 0;
  const days = [1, 2, 3, 4, 5]; // Monday-Friday
  const times = [
    { start: '08:00:00', end: '08:50:00' },
    { start: '09:00:00', end: '09:50:00' },
    { start: '10:00:00', end: '10:50:00' },
    { start: '11:00:00', end: '11:50:00' },
    { start: '13:00:00', end: '13:50:00' },
    { start: '14:00:00', end: '14:50:00' }
  ];

  for (const cls of classes) {
    // Create 2-3 schedule slots per class
    const numSlots = randomInt(2, 3);
    const usedDays = new Set<number>();

    for (let i = 0; i < numSlots; i++) {
      let day: number;
      do {
        day = randomElement(days);
      } while (usedDays.has(day) && usedDays.size < days.length);
      usedDays.add(day);

      const time = randomElement(times);

      const { error } = await supabase
        .from('touchbase_schedules')
        .upsert({
          id: generateUUID(),
          class_id: cls.id,
          day_of_week: day,
          start_time: time.start,
          end_time: time.end,
          is_recurring: true,
          start_date: '2024-09-01',
          end_date: '2025-06-30'
        }, { onConflict: 'id' });

      if (!error) scheduleCount++;
    }
  }

  console.log(`  ✅ ${scheduleCount} schedules created`);
}

async function seedStreaks(users: SeedData['users']): Promise<void> {
  console.log('\n🔥 Creating streaks...');

  const students = users.filter(u => u.role === 'student');
  let streakCount = 0;

  for (const student of students) {
    const currentStreak = randomInt(0, 30);
    const longestStreak = Math.max(currentStreak, randomInt(5, 45));
    const lastActiveDate = currentStreak > 0
      ? new Date().toISOString().split('T')[0]
      : addDays(new Date(), -randomInt(1, 7)).toISOString().split('T')[0];

    const { error } = await supabase
      .from('touchbase_streaks')
      .upsert({
        user_id: student.id,
        current_streak: currentStreak,
        longest_streak: longestStreak,
        last_active_date: lastActiveDate
      }, { onConflict: 'user_id' });

    if (!error) streakCount++;
  }

  console.log(`  ✅ ${streakCount} streaks created`);
}

// ============================================================
// MAIN EXECUTION
// ============================================================

async function main() {
  console.log('🌱 TouchBase Academy - Complete Production-Like Seed Data\n');
  console.log('═'.repeat(60));

  try {
    // Phase 1: Organizations
    const orgs = await seedOrganizations();

    // Phase 2: Users
    const users = await seedUsers(orgs);

    // Phase 3: Classes
    const classes = await seedClasses(users, orgs);

    // Phase 4: Modules with real content
    const modules = await seedModules();

    // Phase 5: Badges
    const badges = await seedBadges();

    // Phase 6: Progress, XP, and Badge Awards
    await seedProgressAndXP(users, modules, badges);

    // Phase 7: Attendance
    await seedAttendance(users, classes);

    // Phase 8: Assignments
    await seedAssignments(classes, modules);

    // Phase 9: Schedules
    await seedSchedules(classes);

    // Phase 10: Streaks
    await seedStreaks(users);

    console.log('\n' + '═'.repeat(60));
    console.log('✅ SEEDING COMPLETE!\n');
    console.log('Summary:');
    console.log(`  📊 Organizations: ${orgs.length}`);
    console.log(`  👥 Users: ${users.length} (${users.filter(u => u.role === 'owner').length} admin, ${users.filter(u => u.role === 'teacher').length} teachers, ${users.filter(u => u.role === 'student').length} students)`);
    console.log(`  📚 Classes: ${classes.length}`);
    console.log(`  📖 Modules: ${modules.length} (with real life skills content)`);
    console.log(`  🏅 Badges: ${badges.length}`);
    console.log('\nTest Credentials:');
    console.log('  Admin: admin1@touchbase.academy');
    console.log('  Teacher: teacher1@touchbase.academy');
    console.log('  Student: student1@touchbase.academy');
    console.log('\n(Note: You\'ll need to create auth users or use magic links to login)');

  } catch (error) {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

main();
