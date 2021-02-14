import { gql } from "@apollo/client";

export const QUERIES = {
    GET_GROUP_BUDGETS: gql`
        query budget($groupId: String) {
            budget(groupId: $groupId) {
                id
                title
                created
                groupId
                comment
                people {
                    paying
                    free
                }
                period {
                    start
                    end
                }
            }
        }
    `,
    GET_BUDGET: gql`
        query budget($id: String) {
            budget(id: $id) {
                id
                title
                created
                groupId
                comment
                people {
                    paying
                    free
                }
                period {
                    start
                    end
                }
            }
        }
    `,
    GET_BUDGET_TOTAL: gql`
        query budgetTotal($budgetId: ID, $people: PeopleInput, $days: Int) {
            budgetTotal(
                budgetId: $budgetId, 
                people: $people,
                days: $days
            )
        }
    `,
    GET_COSTS: gql`
        query cost($budgetId: String) {
            cost(budgetId: $budgetId) {
                id
            }
        }
    `,
    GET_COSTS_BY_BUDGET: gql`
        query cost($budgetId: String) {
            cost(budgetId: $budgetId) {
                id
                title
                comment
                category
                type
                when
                amount
                budgetId
            }
        }
    `,
    GET_COST_BY_ID: gql`
        query cost($id: String) {
            cost(id: $id) {
                title
                comment
                category
                type
                when
                amount
                budgetId
            }
        }
    `,
    GET_GROUP: gql`
        query group($id: String) {
            group(id: $id) {
                id
                name
            }
        }
    `
}

export const SUBS = {
    BUDGET_ADDED: gql`
        subscription budgetAdded($groupId: ID) {
            budgetAdded(groupId: $groupId) {
                title
            }
        }
    `,
    COST_EDITED: gql`
        subscription costEdit($budgetId: ID) {
            costEdit(budgetId: $budgetId) {
                title
            }
        }
    `
}

export const MUTATIONS = {
    ADD_COST: gql`
        mutation addCost ($budgetId: ID, $title: String, $comment: String, $category: CostCategory, $type: CostType, $when: CostWhen, $amount: Float ) {
            addCost(cost: {
                budgetId: $budgetId,
                title: $title,
                comment: $comment,
                category: $category,
                type: $type,
                when: $when,
                amount: $amount
            }){
                title
            }
        }
    `,
    DELETE_BUDGET: gql`
        mutation deleteBudget($id: String) {
            deleteBudget(id: $id){title}
        }
    `,
    UPDATE_COST: gql`
        mutation addCost ($id: ID, $budgetId: ID, $title: String, $comment: String, $category: CostCategory, $type: CostType, $when: CostWhen, $amount: Float ) {
            addCost (
                id: $id,
                cost: {
                    budgetId: $budgetId,
                    title: $title,
                    comment: $comment,
                    category: $category,
                    type: $type,
                    when: $when,
                    amount: $amount
                }
            ){
                title
            }
        }
    `
}