import React, { useEffect, useState } from 'react';
import { useQuery, useSubscription, useMutation } from '@apollo/client';
import { WaveTopBottomLoading } from 'react-loadingg';
import { DragDropContext, Droppable } from 'react-beautiful-dnd';

import { Cards, NotifyNotFound } from '..';
import { QUERIES, SUBS, MUTATIONS } from '../../utils';
import NotifyNoNetwork from '../NotifyNoNetwork';

export default ({ budgetData, editable = true }) => {
    if (!budgetData) throw new Error('[CostsList] No budgetId found');
    
    const [costsDataList, setCostsDataList] = useState();
    const [updatedOrderitem, updateItemOrder] = useState();
    
    const { data: costChanges } = useSubscription(SUBS.COST_EDITED, {
        variables: { budgetId: budgetData.id }
    })
    
    const { loading, data, refetch, error } = useQuery(QUERIES.GET_COSTS_BY_BUDGET, {
        variables: { budgetId: budgetData.id }
    });
    
    const [ updateCost, { loading: updateCostLoading, data: updateCostData, error: updateCostError } ] = useMutation(MUTATIONS.UPDATE_COST);
    
    useEffect(() => {
        if (data?.cost) setCostsDataList(data.cost);
    }, [data])
    
    useEffect(() => {
        refetch({
            variables: { budgetId: budgetData.id }
        });
    }, [costChanges])
    
    useEffect(() => {
        updatedOrderitem && updateCost({ variables: {
            id: updatedOrderitem.draggableId,
            order: updatedOrderitem.destination.index
        }})
    }, [updatedOrderitem])
    
    const handleDragEnd = result => {
        const { destination, source, columns } = result;
        
        if (!destination) return;
        // if (
        //     destination.droppableId === source.droppableId ||
        //     destination.index === source.index
        // ) return
        
        const items = [ ...costsDataList ]
        const [reorderedItem] = items.splice(source.index, 1);
        items.splice(destination.index, 0, reorderedItem);
        
        updateItemOrder(result);
        setCostsDataList(items);
    }
    
    if (error) return <NotifyNoNetwork onClick={ refetch } />
    else if (loading) return <WaveTopBottomLoading />
    else if (data.cost.length == 0) return <NotifyNotFound msg="Er werden geen kosten gevonden" />
    else return <DragDropContext onDragEnd={ handleDragEnd }>
        <Droppable droppableId="testDrop">
            {(provided) => 
                <div
                    ref={ provided.innerRef }
                    { ...provided.droppableProps }
                >
                    { costsDataList.map((c, index) => 
                        <Cards.Cost key={ c.id } data={ c } budgetData={ budgetData } editable={ editable } index={ index }/>) 
                    }
                    { provided.placeholder }
                </div>
            }
        </Droppable>
    </DragDropContext>
}